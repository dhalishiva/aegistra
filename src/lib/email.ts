import { getSiteUrl } from "./site-url";

export type ReviewReminderKind = "upcoming" | "due_today" | "overdue";

export function isReminderEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.REMINDER_FROM_EMAIL &&
      process.env.CRON_SECRET
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wording(kind: ReviewReminderKind, days: number) {
  if (kind === "due_today") {
    return {
      subjectPrefix: "Review due today",
      headline: "This AI system review is due today.",
      timing: "due today",
    };
  }

  if (kind === "overdue") {
    return {
      subjectPrefix: "Overdue AI review",
      headline: "This AI system review is overdue.",
      timing: `${days} day${days === 1 ? "" : "s"} overdue`,
    };
  }

  return {
    subjectPrefix: "Upcoming AI review",
    headline: "An AI system review is coming up.",
    timing: `due in ${days} day${days === 1 ? "" : "s"}`,
  };
}

export async function sendReviewReminderEmail(input: {
  recipient: string;
  systemId: string;
  systemName: string;
  workspaceName: string;
  dueDate: string;
  kind: ReviewReminderKind;
  days: number;
  dedupeKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false as const,
      id: null,
      error: "Transactional email is not configured.",
    };
  }

  const copy = wording(input.kind, input.days);
  const systemUrl = `${getSiteUrl()}/app/systems/${input.systemId}`;
  const subject = `${copy.subjectPrefix}: ${input.systemName}`;

  const html = `
    <div style="background:#071019;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#e8f0f7">
      <div style="max-width:620px;margin:0 auto;background:#0b1621;border:1px solid #1e293b;border-radius:18px;padding:28px">
        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#38bdf8;font-weight:700">Aegistra review reminder</div>
        <h1 style="font-size:26px;line-height:1.25;margin:14px 0 8px;color:#ffffff">${escapeHtml(copy.headline)}</h1>
        <p style="margin:0 0 22px;color:#94a3b8;line-height:1.7">
          <strong style="color:#e2e8f0">${escapeHtml(input.systemName)}</strong>
          in ${escapeHtml(input.workspaceName)} is ${escapeHtml(copy.timing)}.
        </p>
        <div style="background:#071019;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:22px">
          <div style="font-size:12px;color:#64748b">Review due</div>
          <div style="margin-top:5px;font-size:16px;color:#e2e8f0">${escapeHtml(input.dueDate)}</div>
        </div>
        <a href="${escapeHtml(systemUrl)}" style="display:inline-block;background:#38bdf8;color:#071019;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">
          Open system review
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b">
          You received this because your email is listed as the owner of this AI system in Aegistra.
        </p>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.dedupeKey,
    },
    body: JSON.stringify({
      from,
      to: [input.recipient],
      subject,
      html,
      ...(process.env.REMINDER_REPLY_TO
        ? { reply_to: process.env.REMINDER_REPLY_TO }
        : {}),
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    return {
      ok: false as const,
      id: null,
      error:
        body.message ||
        body.error?.message ||
        `Resend returned HTTP ${response.status}.`,
    };
  }

  return {
    ok: true as const,
    id: body.id ?? null,
    error: null,
  };
}
