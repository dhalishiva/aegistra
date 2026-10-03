"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";
import { scoreGovernancePriority } from "./scoring";

async function authed() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await authed();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Workspace name is required");

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("workspace_members").insert({ workspace_id: workspace.id, user_id: user.id, role: "owner" });
  await supabase.from("profiles").upsert({ user_id: user.id, full_name: String(formData.get("full_name") || "") });
  redirect("/app");
}

export async function createAiSystem(formData: FormData) {
  const { supabase, user } = await authed();
  const { data: member } = await supabase.from("workspace_members").select("workspace_id, workspace:workspaces(plan)").eq("user_id", user.id).limit(1).single();
  if (!member) throw new Error("No workspace");
  const workspaceInfo = Array.isArray(member.workspace) ? member.workspace[0] : member.workspace;
  const plan = workspaceInfo?.plan || "free";
  const limits: Record<string, number> = { free: 3, team: 50, business: 100000, enterprise: 100000 };
  const { count } = await supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("workspace_id", member.workspace_id);
  if ((count || 0) >= (limits[plan] || 3)) throw new Error(`Your ${plan} plan AI-system limit has been reached.`);

  const dataSensitivity = String(formData.get("data_sensitivity")) as "none" | "internal" | "personal" | "sensitive";
  const autonomy = String(formData.get("autonomy")) as "assistive" | "recommendation" | "decision" | "autonomous";
  const impact = String(formData.get("impact")) as "low" | "moderate" | "high";
  const humanReview = formData.get("human_review") === "on";
  const publicInteraction = formData.get("public_interaction") === "on";
  const generatesContent = formData.get("generates_content") === "on";
  const priority = scoreGovernancePriority({ dataSensitivity, autonomy, impact, humanReview, publicInteraction, generatesContent });

  const payload = {
    workspace_id: member.workspace_id,
    name: String(formData.get("name") || "").trim(),
    provider: String(formData.get("provider") || "").trim(),
    purpose: String(formData.get("purpose") || "").trim(),
    owner_name: String(formData.get("owner_name") || "").trim(),
    owner_email: String(formData.get("owner_email") || "").trim(),
    lifecycle: String(formData.get("lifecycle") || "production"),
    data_sensitivity: dataSensitivity,
    autonomy,
    impact,
    human_review: humanReview,
    public_interaction: publicInteraction,
    generates_content: generatesContent,
    priority_score: priority.score,
    priority_level: priority.level,
    review_due: String(formData.get("review_due") || "") || null,
    created_by: user.id,
  };
  if (!payload.name || !payload.purpose) throw new Error("Name and purpose are required");
  const { error } = await supabase.from("ai_systems").insert(payload);
  if (error) throw error;
  revalidatePath("/app");
  revalidatePath("/app/systems");
  redirect("/app/systems");
}

export async function createActionItem(formData: FormData) {
  const { supabase, user } = await authed();
  const { data: member } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
  if (!member) throw new Error("No workspace");
  const { error } = await supabase.from("action_items").insert({
    workspace_id: member.workspace_id,
    title: String(formData.get("title") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
    due_date: String(formData.get("due_date") || "") || null,
    status: "open",
    created_by: user.id,
  });
  if (error) throw error;
  revalidatePath("/app/actions");
}

export async function markActionDone(formData: FormData) {
  const { supabase } = await authed();
  const id = String(formData.get("id"));
  await supabase.from("action_items").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/app/actions");
}
