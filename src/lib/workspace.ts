import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

export async function getSessionContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id,name,plan)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace) redirect("/onboarding");
  const workspace = Array.isArray(membership.workspace) ? membership.workspace[0] : membership.workspace;
  return { supabase, user, membership, workspace: workspace as { id: string; name: string; plan: string } };
}
