import { redirect } from "next/navigation";
import { Shield, Trash2, UserCog, Users, XCircle } from "lucide-react";
import { InviteMemberForm } from "@/components/invite-member-form";
import {
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
  updateWorkspaceMemberRole,
} from "@/lib/team-actions";
import { createClient } from "@/lib/supabase-server";
import { getSessionContext } from "@/lib/workspace";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

type Member = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
};

type Invitation = {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  expires_at: string;
  created_at: string;
};

export default async function Settings() {
  const { supabase, user, workspace, membership } = await getSessionContext();
  const canManage = membership.role === "owner" || membership.role === "admin";

  const membersResult = await supabase.rpc("workspace_member_directory", {
    p_workspace_id: workspace.id,
  });

  const invitationsResult = canManage
    ? await supabase
        .from("workspace_invitations")
        .select("id,email,role,expires_at,created_at")
        .eq("workspace_id", workspace.id)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
    : { data: [] as Invitation[] };

  const members = (membersResult.data ?? []) as Member[];
  const invitations = (invitationsResult.data ?? []) as Invitation[];
  const now = Date.now();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="kicker">Settings</div>
      <h1 className="mt-2 text-3xl font-black">Workspace settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        Manage workspace access, roles and your account.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Workspace" value={workspace.name} />
        <Summary label="Plan" value={workspace.plan} />
        <Summary label="Members" value={String(members.length)} />
        <Summary label="Your role" value={membership.role} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-bold">Workspace members</h2>
              <p className="mt-1 text-xs text-slate-500">
                Roles are enforced by database policies, not only by this screen.
              </p>
            </div>
            <Users size={18} className="text-sky-300" />
          </div>

          <div className="divide-y divide-white/10">
            {members.map((member) => {
              const isSelf = member.user_id === user.id;
              const ownerCanManage =
                membership.role === "owner" &&
                !isSelf &&
                member.role !== "owner";
              const adminCanManage =
                membership.role === "admin" &&
                !isSelf &&
                (member.role === "member" || member.role === "viewer");
              const canManageMember = ownerCanManage || adminCanManage;

              return (
                <div
                  key={member.user_id}
                  className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate font-semibold">
                        {member.full_name || member.email}
                      </div>
                      {isSelf && <span className="badge">You</span>}
                      {member.role === "owner" && (
                        <span className="badge text-sky-300">Owner</span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {member.email}
                    </div>
                  </div>

                  {canManageMember ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <form
                        action={updateWorkspaceMemberRole}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="user_id"
                          value={member.user_id}
                        />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="input min-w-32 py-2 text-sm"
                          aria-label={`Role for ${member.email}`}
                        >
                          {membership.role === "owner" && (
                            <option value="admin">Admin</option>
                          )}
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button className="btn-secondary gap-2 px-3 py-2 text-xs">
                          <UserCog size={14} />
                          Save
                        </button>
                      </form>

                      <form action={removeWorkspaceMember}>
                        <input
                          type="hidden"
                          name="user_id"
                          value={member.user_id}
                        />
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:text-red-300"
                          aria-label={`Remove ${member.email}`}
                          title="Remove member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="badge capitalize">{member.role}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          {canManage && (
            <InviteMemberForm canInviteAdmin={membership.role === "owner"} />
          )}

          <section className="card p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white/[0.04] p-2 text-slate-300">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="font-bold">Role model</h2>
                <div className="mt-3 space-y-3 text-xs leading-5 text-slate-500">
                  <Role
                    name="Owner"
                    text="Highest control. Manages admins and all workspace members."
                  />
                  <Role
                    name="Admin"
                    text="Manages members/viewers and can perform governance work."
                  />
                  <Role
                    name="Member"
                    text="Creates and updates systems, reviews, actions and evidence."
                  />
                  <Role
                    name="Viewer"
                    text="Read-only access to workspace governance records."
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {canManage && (
        <section className="card mt-5 overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-bold">Pending invitations</h2>
            <p className="mt-1 text-xs text-slate-500">
              Revoke an invitation and create a new one if its link is lost or
              expired.
            </p>
          </div>

          {invitations.length ? (
            <div className="divide-y divide-white/10">
              {invitations.map((invite) => {
                const expired = new Date(invite.expires_at).getTime() <= now;

                return (
                  <div
                    key={invite.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{invite.email}</span>
                        <span className="badge capitalize">{invite.role}</span>
                        <span
                          className={
                            expired
                              ? "badge text-amber-300"
                              : "badge text-emerald-300"
                          }
                        >
                          {expired ? "Expired" : "Pending"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Expires {new Date(invite.expires_at).toLocaleString()}
                      </div>
                    </div>

                    <form action={revokeWorkspaceInvitation}>
                      <input
                        type="hidden"
                        name="invitation_id"
                        value={invite.id}
                      />
                      <button className="btn-secondary gap-2 px-3 py-2 text-xs">
                        <XCircle size={14} />
                        Revoke
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No pending invitations.
            </div>
          )}
        </section>
      )}

      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <div>
          <div className="text-sm font-medium">{user.email}</div>
          <div className="mt-1 text-xs text-slate-500">
            Signed in to Aegistra
          </div>
        </div>
        <form action={signOut}>
          <button className="btn-secondary">Sign out</button>
        </form>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 truncate text-lg font-bold capitalize">{value}</div>
    </div>
  );
}

function Role({ name, text }: { name: string; text: string }) {
  return (
    <div>
      <div className="font-semibold text-slate-300">{name}</div>
      <div>{text}</div>
    </div>
  );
}
