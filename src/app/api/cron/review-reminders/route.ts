import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  isReminderEmailConfigured,
  sendReviewReminderEmail,
  type ReviewReminderKind,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SENDS_PER_RUN = 250;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((to - from) / DAY_MS);
}

function reminderFor(
  today: string,
  dueDate: string,
  daysBefore: number,
  includeOverdue: boolean,
  overdueRepeatDays: number
): { kind: ReviewReminderKind; days: number; cycle: number } | null {
  const daysUntil = daysBetween(today, dueDate);

  if (daysUntil > 0) {
    if (daysUntil > daysBefore) return null;
    return { kind: "upcoming", days: daysUntil, cycle: 0 };
  }

  if (daysUntil === 0) {
    return { kind: "due_today", days: 0, cycle: 0 };
  }

  if (!includeOverdue) return null;

  const daysOverdue = Math.abs(daysUntil);
  if ((daysOverdue - 1) % overdueRepeatDays !== 0) return null;

  return {
    kind: "overdue",
    days: daysOverdue,
    cycle: Math.floor((daysOverdue - 1) / overdueRepeatDays),
  };
}

function dedupeKey(parts: string[]) {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  if (!isReminderEmailConfigured()) {
    return Response.json(
      {
        ok: false,
        error:
          "Reminder email delivery is not configured. Set RESEND_API_KEY and REMINDER_FROM_EMAIL.",
      },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const today = isoDate(new Date());

  const { data: settingsRows, error: settingsError } = await admin
    .from("workspace_reminder_settings")
    .select(
      "workspace_id,days_before,include_overdue,overdue_repeat_days,workspace:workspaces(name)"
    )
    .eq("enabled", true);

  if (settingsError) {
    return Response.json(
      { ok: false, error: settingsError.message },
      { status: 500 }
    );
  }

  const summary = {
    workspaces: settingsRows?.length ?? 0,
    candidates: 0,
    noRecipient: 0,
    alreadySent: 0,
    sent: 0,
    failed: 0,
    capped: false,
  };

  let attempted = 0;

  for (const settings of settingsRows ?? []) {
    if (attempted >= MAX_SENDS_PER_RUN) {
      summary.capped = true;
      break;
    }

    const workspace = Array.isArray(settings.workspace)
      ? settings.workspace[0]
      : settings.workspace;
    const workspaceName = workspace?.name || "your workspace";
    const horizon = isoDate(addDays(new Date(`${today}T00:00:00Z`), settings.days_before));

    const { data: systems, error: systemsError } = await admin
      .from("ai_systems")
      .select("id,name,owner_email,review_due,lifecycle")
      .eq("workspace_id", settings.workspace_id)
      .neq("lifecycle", "retired")
      .not("review_due", "is", null)
      .lte("review_due", horizon)
      .order("review_due", { ascending: true });

    if (systemsError) {
      summary.failed += 1;
      continue;
    }

    for (const system of systems ?? []) {
      if (attempted >= MAX_SENDS_PER_RUN) {
        summary.capped = true;
        break;
      }

      if (!system.review_due) continue;

      const reminder = reminderFor(
        today,
        system.review_due,
        settings.days_before,
        settings.include_overdue,
        settings.overdue_repeat_days
      );

      if (!reminder) continue;

      summary.candidates += 1;

      const recipient = system.owner_email?.trim().toLowerCase();
      if (!recipient) {
        summary.noRecipient += 1;
        continue;
      }

      const key = dedupeKey([
        settings.workspace_id,
        system.id,
        recipient,
        system.review_due,
        reminder.kind,
        String(reminder.cycle),
      ]);

      const { data: existingSent } = await admin
        .from("review_reminder_deliveries")
        .select("id")
        .eq("dedupe_key", key)
        .eq("status", "sent")
        .limit(1)
        .maybeSingle();

      if (existingSent) {
        summary.alreadySent += 1;
        continue;
      }

      attempted += 1;

      const delivery = await sendReviewReminderEmail({
        recipient,
        systemId: system.id,
        systemName: system.name,
        workspaceName,
        dueDate: system.review_due,
        kind: reminder.kind,
        days: reminder.days,
        dedupeKey: key,
      });

      const { error: logError } = await admin
        .from("review_reminder_deliveries")
        .insert({
          workspace_id: settings.workspace_id,
          ai_system_id: system.id,
          recipient_email: recipient,
          reminder_kind: reminder.kind,
          due_date: system.review_due,
          dedupe_key: key,
          status: delivery.ok ? "sent" : "failed",
          provider_message_id: delivery.id,
          error_message: delivery.error,
          sent_at: delivery.ok ? new Date().toISOString() : null,
        });

      if (logError) {
        summary.failed += 1;
        continue;
      }

      if (delivery.ok) {
        summary.sent += 1;

        await admin.from("activity_events").insert({
          workspace_id: settings.workspace_id,
          actor_id: null,
          actor_email: null,
          action: "review_reminder.sent",
          entity_type: "ai_system",
          entity_id: system.id,
          entity_name: system.name,
          metadata: {
            recipient,
            reminder_kind: reminder.kind,
            due_date: system.review_due,
          },
        });
      } else {
        summary.failed += 1;
      }
    }
  }

  return Response.json({
    ok: true,
    date: today,
    summary,
  });
}
