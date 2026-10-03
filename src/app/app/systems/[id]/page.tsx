import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import {
  completeSystemReview,
  updateAiSystem,
} from "@/lib/actions";
import { getSessionContext } from "@/lib/workspace";

export default async function SystemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, workspace, user } = await getSessionContext();

  const [systemResult, reviewsResult] = await Promise.all([
    supabase
      .from("ai_systems")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
    supabase
      .from("system_reviews")
      .select("id,reviewer_id,outcome,notes,reviewed_at,next_review_due")
      .eq("ai_system_id", id)
      .eq("workspace_id", workspace.id)
      .order("reviewed_at", { ascending: false }),
  ]);

  const system = systemResult.data;
  if (!system) notFound();

  const reviews = reviewsResult.data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/app/systems"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to AI systems
      </Link>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="kicker">AI system</div>
          <h1 className="mt-2 text-3xl font-bold">{system.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {system.purpose}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`badge badge-${system.priority_level} capitalize`}>
            {system.priority_level} · {system.priority_score}/100
          </span>
          <span className="badge capitalize">{system.lifecycle}</span>
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <form action={updateAiSystem} className="card space-y-6 p-6">
          <input type="hidden" name="id" value={system.id} />

          <div>
            <h2 className="text-lg font-bold">System details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep the operating record current as the use case changes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="System / use name"
              name="name"
              defaultValue={system.name}
              required
            />
            <Field
              label="Provider / product"
              name="provider"
              defaultValue={system.provider || ""}
            />

            <div className="sm:col-span-2">
              <label className="label">Purpose</label>
              <textarea
                name="purpose"
                required
                defaultValue={system.purpose}
                className="input min-h-24"
              />
            </div>

            <Field
              label="Owner name"
              name="owner_name"
              defaultValue={system.owner_name || ""}
            />
            <Field
              label="Owner email"
              name="owner_email"
              type="email"
              defaultValue={system.owner_email || ""}
            />

            <div>
              <label className="label">Lifecycle</label>
              <select
                name="lifecycle"
                className="input"
                defaultValue={system.lifecycle}
              >
                <option value="pilot">Pilot</option>
                <option value="production">Production</option>
                <option value="paused">Paused</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <Field
              label="Next review"
              name="review_due"
              type="date"
              defaultValue={system.review_due || ""}
            />
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="font-bold">Governance inputs</h2>
            <p className="mt-1 text-sm text-slate-500">
              Changing these values recalculates the governance-priority score.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Select
                label="Data sensitivity"
                name="data_sensitivity"
                defaultValue={system.data_sensitivity}
                options={[
                  ["none", "None"],
                  ["internal", "Internal"],
                  ["personal", "Personal"],
                  ["sensitive", "Sensitive"],
                ]}
              />
              <Select
                label="Autonomy"
                name="autonomy"
                defaultValue={system.autonomy}
                options={[
                  ["assistive", "Assistive"],
                  ["recommendation", "Recommendation"],
                  ["decision", "Decision"],
                  ["autonomous", "Autonomous"],
                ]}
              />
              <Select
                label="Potential impact"
                name="impact"
                defaultValue={system.impact}
                options={[
                  ["low", "Low"],
                  ["moderate", "Moderate"],
                  ["high", "High"],
                ]}
              />
            </div>

            <div className="mt-4 grid gap-3">
              <Check
                name="human_review"
                label="Human review before material action"
                defaultChecked={system.human_review}
              />
              <Check
                name="public_interaction"
                label="Interacts with customers/public"
                defaultChecked={system.public_interaction}
              />
              <Check
                name="generates_content"
                label="Generates externally visible content"
                defaultChecked={system.generates_content}
              />
            </div>
          </div>

          <div>
            <label className="label">Internal notes</label>
            <textarea
              name="notes"
              defaultValue={system.notes || ""}
              className="input min-h-24"
              placeholder="Context, guardrails, known limitations, dependencies…"
            />
          </div>

          <div className="flex justify-end border-t border-white/10 pt-5">
            <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
          </div>
        </form>

        <div className="space-y-5">
          <form action={completeSystemReview} className="card p-6">
            <input type="hidden" name="id" value={system.id} />

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-sky-400/10 p-2 text-sky-300">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="font-bold">Record a review</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Reviews are append-only history records.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="label">Outcome</label>
                <select name="outcome" className="input" defaultValue="approved">
                  <option value="approved">Approved / continue</option>
                  <option value="changes_required">Changes required</option>
                  <option value="paused">Pause this system</option>
                </select>
              </div>

              <div>
                <label className="label">Review notes</label>
                <textarea
                  name="review_notes"
                  className="input min-h-24"
                  placeholder="What was checked? What changed? What remains open?"
                />
              </div>

              <Field
                label="Next review due"
                name="next_review_due"
                type="date"
                defaultValue={system.review_due || ""}
              />

              <SubmitButton pendingLabel="Recording…" className="btn-primary w-full">Record review</SubmitButton>
            </div>
          </form>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Review history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {reviews.length} recorded review{reviews.length === 1 ? "" : "s"}
                </p>
              </div>
              <Clock3 size={18} className="text-slate-500" />
            </div>

            <div className="mt-5 space-y-4">
              {reviews.length ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-l border-white/10 pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge capitalize">
                        {review.outcome.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(review.reviewed_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      {review.notes || "No review notes recorded."}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {review.reviewer_id === user.id
                        ? "Reviewed by you"
                        : "Reviewed by a workspace member"}
                      {review.next_review_due
                        ? ` · next review ${review.next_review_due}`
                        : ""}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <ShieldAlert className="mx-auto text-slate-600" size={24} />
                  <p className="mt-3 text-sm text-slate-500">
                    No formal reviews have been recorded yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" name={name} defaultValue={defaultValue}>
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex gap-3 rounded-xl border border-white/10 p-3 text-sm text-slate-300">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
