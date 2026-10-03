import { BellRing, CheckCircle2, MailWarning } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { updateReviewReminderSettings } from "@/lib/reminder-actions";

type Settings = {
  enabled: boolean;
  days_before: number;
  include_overdue: boolean;
  overdue_repeat_days: number;
};

type Delivery = {
  id: string;
  recipient_email: string;
  reminder_kind: string;
  due_date: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  system: { name: string } | { name: string }[] | null;
};

export function ReminderSettingsPanel({
  settings,
  canManage,
  providerConfigured,
  recentDeliveries,
  missingOwnerEmail,
}: {
  settings: Settings;
  canManage: boolean;
  providerConfigured: boolean;
  recentDeliveries: Delivery[];
  missingOwnerEmail: number;
}) {
  return (
    <section className="card mt-5 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BellRing size={18} className="text-sky-300" />
            <h2 className="font-bold">Review reminders</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Aegistra checks review dates once per day and emails the AI system
            owner when a review is approaching or overdue.
          </p>
        </div>
        <span
          className={
            providerConfigured
              ? "badge text-emerald-300"
              : "badge text-amber-300"
          }
        >
          {providerConfigured ? "Email delivery configured" : "Email setup required"}
        </span>
      </div>

      <div className="grid gap-0 xl:grid-cols-[.8fr_1.2fr]">
        <div className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
          <form action={updateReviewReminderSettings} className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-white/10 p-3">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={settings.enabled}
                disabled={!canManage}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Enable review reminder emails
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Emails are sent to the owner email stored on each AI system.
                </span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">First reminder</label>
                <div className="flex items-center gap-2">
                  <input
                    name="days_before"
                    type="number"
                    min={1}
                    max={60}
                    defaultValue={settings.days_before}
                    disabled={!canManage}
                    className="input"
                  />
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    days before
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Repeat overdue</label>
                <div className="flex items-center gap-2">
                  <input
                    name="overdue_repeat_days"
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={settings.overdue_repeat_days}
                    disabled={!canManage}
                    className="input"
                  />
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    days
                  </span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                name="include_overdue"
                defaultChecked={settings.include_overdue}
                disabled={!canManage}
              />
              Continue reminding owners when reviews become overdue
            </label>

            {!providerConfigured && (
              <div className="flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs leading-5 text-amber-100">
                <MailWarning size={16} className="mt-0.5 shrink-0" />
                The workflow is installed, but production email requires
                SMTP settings (or RESEND_API_KEY), REMINDER_FROM_EMAIL and CRON_SECRET in Vercel.
              </div>
            )}

            {missingOwnerEmail > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs leading-5 text-slate-500">
                {missingOwnerEmail} system{missingOwnerEmail === 1 ? "" : "s"} with
                a review date currently {missingOwnerEmail === 1 ? "has" : "have"} no
                owner email, so no reminder can be delivered for those records.
              </div>
            )}

            {canManage && (
              <SubmitButton pendingLabel="Saving…" className="btn-primary w-full">Save reminder settings</SubmitButton>
            )}
          </form>
        </div>

        <div className="p-5">
          <div>
            <h3 className="font-semibold">Recent delivery history</h3>
            <p className="mt-1 text-xs text-slate-500">
              The latest reminder attempts for this workspace.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {recentDeliveries.length ? (
              recentDeliveries.map((delivery) => {
                const system = Array.isArray(delivery.system)
                  ? delivery.system[0]
                  : delivery.system;

                return (
                  <div
                    key={delivery.id}
                    className="rounded-xl border border-white/10 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={
                            delivery.status === "sent"
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }
                        />
                        <span className="text-sm font-medium">
                          {system?.name || "AI system"}
                        </span>
                      </div>
                      <span className="badge capitalize">{delivery.status}</span>
                    </div>

                    <div className="mt-2 text-xs leading-5 text-slate-500">
                      {delivery.recipient_email} ·{" "}
                      {delivery.reminder_kind.replace("_", " ")} · review due{" "}
                      {delivery.due_date}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      {new Date(
                        delivery.sent_at || delivery.created_at
                      ).toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                No reminder attempts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
