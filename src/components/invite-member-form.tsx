"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Mail, UserPlus } from "lucide-react";
import {
  createWorkspaceInvitation,
  type InviteState,
} from "@/lib/team-actions";

const initialState: InviteState = {
  ok: false,
  error: null,
};

export function InviteMemberForm({
  canInviteAdmin,
}: {
  canInviteAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    createWorkspaceInvitation,
    initialState
  );
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    if (!state.inviteUrl) return;
    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-sky-400/10 p-2 text-sky-300">
          <UserPlus size={18} />
        </div>
        <div>
          <h2 className="font-bold">Invite teammate</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Invite links expire after 7 days and only work for the email address
            they were created for.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <label className="label">Email address</label>
          <input
            name="email"
            type="email"
            required
            className="input"
            placeholder="teammate@company.com"
          />
        </div>

        <div>
          <label className="label">Role</label>
          <select name="role" defaultValue="member" className="input">
            {canInviteAdmin && <option value="admin">Admin</option>}
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Admins manage members. Members can create and update governance
            records. Viewers are read-only.
          </p>
        </div>

        {state.error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-200">
            {state.error}
          </div>
        )}

        <button disabled={pending} className="btn-primary w-full gap-2">
          <Mail size={16} />
          {pending ? "Creating invite…" : "Create invite link"}
        </button>
      </form>

      {state.ok && state.inviteUrl && (
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Check size={16} />
            Invite ready for {state.email}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={state.inviteUrl}
              className="input min-w-0 flex-1 text-xs"
              aria-label="Invitation link"
            />
            <button
              type="button"
              onClick={copyInvite}
              className="btn-secondary shrink-0 gap-2"
            >
              <Copy size={15} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <a
            href={`mailto:${encodeURIComponent(state.email || "")}?subject=${encodeURIComponent(
              "Join our Aegistra workspace"
            )}&body=${encodeURIComponent(
              `You have been invited to our Aegistra workspace as ${state.role}.\n\nAccept the invitation:\n${state.inviteUrl}`
            )}`}
            className="mt-3 inline-flex text-xs font-semibold text-sky-300 hover:text-sky-200"
          >
            Open in email app
          </a>
        </div>
      )}
    </div>
  );
}
