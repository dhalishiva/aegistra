"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";
import { getSessionContext } from "./workspace";
import { getSiteUrl } from "./site-url";

export type InviteState = {
  ok: boolean;
  error: string | null;
  inviteUrl?: string;
  email?: string;
  role?: "admin" | "member" | "viewer";
};

export const initialInviteState: InviteState = {
  ok: false,
  error: null,
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createWorkspaceInvitation(
  _previousState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const { supabase, user, membership, workspace } = await getSessionContext();
  const email = normalizeEmail(formData.get("email"));
  const role = String(formData.get("role") || "member") as
    | "admin"
    | "member"
    | "viewer";

  if (!validEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (!["admin", "member", "viewer"].includes(role)) {
    return { ok: false, error: "Choose a valid workspace role." };
  }

  if (!["owner", "admin"].includes(membership.role)) {
    return { ok: false, error: "Only workspace owners and admins can invite people." };
  }

  if (role === "admin" && membership.role !== "owner") {
    return { ok: false, error: "Only the workspace owner can invite another admin." };
  }

  if (email === user.email?.toLowerCase()) {
    return { ok: false, error: "You are already a member of this workspace." };
  }

  const { data: existingMemberDirectory } = await supabase.rpc(
    "workspace_member_directory",
    { p_workspace_id: workspace.id }
  );

  const alreadyMember = (existingMemberDirectory ?? []).some(
    (member: { email: string | null }) => member.email?.toLowerCase() === email
  );

  if (alreadyMember) {
    return { ok: false, error: "That email is already a workspace member." };
  }

  await supabase
    .from("workspace_invitations")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("workspace_invitations").insert({
    workspace_id: workspace.id,
    email,
    role,
    token_hash: tokenHash,
    invited_by: user.id,
    expires_at: expiresAt,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/activity");

  return {
    ok: true,
    error: null,
    email,
    role,
    inviteUrl: `${getSiteUrl()}/invite/${token}`,
  };
}

export async function acceptWorkspaceInvitation(formData: FormData) {
  const token = String(formData.get("token") || "").trim();

  if (!token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const tokenHash = hashToken(token);
  const { error } = await supabase.rpc("accept_workspace_invitation", {
    p_token_hash: tokenHash,
  });

  if (error) {
    const message = error.message.toLowerCase();
    let code = "failed";

    if (message.includes("email address")) code = "wrong_email";
    else if (message.includes("another workspace")) code = "existing_workspace";
    else if (message.includes("invalid or expired")) code = "invalid";

    redirect(`/invite/${token}?error=${code}`);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/activity");
  redirect("/app?joined=1");
}

export async function revokeWorkspaceInvitation(formData: FormData) {
  const { supabase, membership, workspace } = await getSessionContext();
  const invitationId = String(formData.get("invitation_id") || "");

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Only workspace owners and admins can revoke invitations.");
  }

  const { error } = await supabase
    .from("workspace_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("workspace_id", workspace.id)
    .is("accepted_at", null)
    .is("revoked_at", null);

  if (error) throw error;

  revalidatePath("/app/settings");
  revalidatePath("/app/activity");
}

export async function updateWorkspaceMemberRole(formData: FormData) {
  const { supabase, membership, workspace } = await getSessionContext();
  const targetUserId = String(formData.get("user_id") || "");
  const role = String(formData.get("role") || "") as
    | "admin"
    | "member"
    | "viewer";

  if (!targetUserId || !["admin", "member", "viewer"].includes(role)) {
    throw new Error("Invalid member role update.");
  }

  if (role === "admin" && membership.role !== "owner") {
    throw new Error("Only the workspace owner can promote an admin.");
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspace.id)
    .eq("user_id", targetUserId)
    .select("user_id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("You do not have permission to change this member.");

  revalidatePath("/app/settings");
  revalidatePath("/app/activity");
}

export async function removeWorkspaceMember(formData: FormData) {
  const { supabase, workspace } = await getSessionContext();
  const targetUserId = String(formData.get("user_id") || "");

  if (!targetUserId) throw new Error("Member id is required.");

  const { data, error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("user_id", targetUserId)
    .select("user_id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("You do not have permission to remove this member.");

  revalidatePath("/app/settings");
  revalidatePath("/app/activity");
}
