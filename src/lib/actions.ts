"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";
import { scoreGovernancePriority } from "./scoring";

type DataSensitivity = "none" | "internal" | "personal" | "sensitive";
type Autonomy = "assistive" | "recommendation" | "decision" | "autonomous";
type Impact = "low" | "moderate" | "high";

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

function governanceInputs(formData: FormData) {
  const dataSensitivity = String(
    formData.get("data_sensitivity") || "none"
  ) as DataSensitivity;
  const autonomy = String(
    formData.get("autonomy") || "assistive"
  ) as Autonomy;
  const impact = String(formData.get("impact") || "low") as Impact;
  const humanReview = formData.get("human_review") === "on";
  const publicInteraction = formData.get("public_interaction") === "on";
  const generatesContent = formData.get("generates_content") === "on";

  return {
    dataSensitivity,
    autonomy,
    impact,
    humanReview,
    publicInteraction,
    generatesContent,
  };
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

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) throw memberError;

  await supabase.from("profiles").upsert({
    user_id: user.id,
    full_name: String(formData.get("full_name") || ""),
  });

  redirect("/app");
}

export async function createAiSystem(formData: FormData) {
  const { supabase, user } = await authed();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspace:workspaces(plan)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) throw new Error("No workspace");

  const workspaceInfo = Array.isArray(member.workspace)
    ? member.workspace[0]
    : member.workspace;
  const plan = workspaceInfo?.plan || "free";
  const limits: Record<string, number> = {
    free: 3,
    team: 50,
    business: 100000,
    enterprise: 100000,
  };

  const { count } = await supabase
    .from("ai_systems")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", member.workspace_id);

  if ((count || 0) >= (limits[plan] || 3)) {
    redirect("/app/systems/new?limit=1");
  }

  const inputs = governanceInputs(formData);
  const priority = scoreGovernancePriority(inputs);

  const payload = {
    workspace_id: member.workspace_id,
    name: String(formData.get("name") || "").trim(),
    provider: String(formData.get("provider") || "").trim(),
    purpose: String(formData.get("purpose") || "").trim(),
    owner_name: String(formData.get("owner_name") || "").trim(),
    owner_email: String(formData.get("owner_email") || "").trim(),
    lifecycle: String(formData.get("lifecycle") || "production"),
    data_sensitivity: inputs.dataSensitivity,
    autonomy: inputs.autonomy,
    impact: inputs.impact,
    human_review: inputs.humanReview,
    public_interaction: inputs.publicInteraction,
    generates_content: inputs.generatesContent,
    priority_score: priority.score,
    priority_level: priority.level,
    review_due: String(formData.get("review_due") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
    created_by: user.id,
  };

  if (!payload.name || !payload.purpose) {
    throw new Error("Name and purpose are required");
  }

  const { error } = await supabase.from("ai_systems").insert(payload);
  if (error) throw error;

  revalidatePath("/app");
  revalidatePath("/app/systems");
  redirect("/app/systems");
}

export async function updateAiSystem(formData: FormData) {
  const { supabase } = await authed();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("System id is required");

  const inputs = governanceInputs(formData);
  const priority = scoreGovernancePriority(inputs);

  const payload = {
    name: String(formData.get("name") || "").trim(),
    provider: String(formData.get("provider") || "").trim(),
    purpose: String(formData.get("purpose") || "").trim(),
    owner_name: String(formData.get("owner_name") || "").trim(),
    owner_email: String(formData.get("owner_email") || "").trim(),
    lifecycle: String(formData.get("lifecycle") || "production"),
    data_sensitivity: inputs.dataSensitivity,
    autonomy: inputs.autonomy,
    impact: inputs.impact,
    human_review: inputs.humanReview,
    public_interaction: inputs.publicInteraction,
    generates_content: inputs.generatesContent,
    priority_score: priority.score,
    priority_level: priority.level,
    review_due: String(formData.get("review_due") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (!payload.name || !payload.purpose) {
    throw new Error("Name and purpose are required");
  }

  const { error } = await supabase
    .from("ai_systems")
    .update(payload)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/app");
  revalidatePath("/app/systems");
  revalidatePath(`/app/systems/${id}`);
}

export async function completeSystemReview(formData: FormData) {
  const { supabase, user } = await authed();
  const id = String(formData.get("id") || "");
  const outcome = String(formData.get("outcome") || "approved");
  const notes = String(formData.get("review_notes") || "").trim();
  const nextReviewDue =
    String(formData.get("next_review_due") || "") || null;

  if (!id) throw new Error("System id is required");

  const { data: system, error: systemError } = await supabase
    .from("ai_systems")
    .select("id,workspace_id")
    .eq("id", id)
    .single();

  if (systemError || !system) {
    throw systemError || new Error("System not found");
  }

  const { error: reviewError } = await supabase
    .from("system_reviews")
    .insert({
      workspace_id: system.workspace_id,
      ai_system_id: system.id,
      reviewer_id: user.id,
      outcome,
      notes: notes || null,
      next_review_due: nextReviewDue,
    });

  if (reviewError) throw reviewError;

  const systemUpdate: Record<string, string | null> = {
    last_reviewed: new Date().toISOString().slice(0, 10),
    review_due: nextReviewDue,
    updated_at: new Date().toISOString(),
  };

  if (outcome === "paused") {
    systemUpdate.lifecycle = "paused";
  }

  const { error: updateError } = await supabase
    .from("ai_systems")
    .update(systemUpdate)
    .eq("id", id);

  if (updateError) throw updateError;

  revalidatePath("/app");
  revalidatePath("/app/systems");
  revalidatePath(`/app/systems/${id}`);
}

export async function createActionItem(formData: FormData) {
  const { supabase, user } = await authed();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

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

  const { error } = await supabase
    .from("action_items")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/app/actions");
}


const evidenceMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function uploadEvidence(formData: FormData) {
  const { supabase, user } = await authed();

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (memberError || !member) {
    throw memberError || new Error("No workspace");
  }

  const title = String(formData.get("title") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const validUntil = String(formData.get("valid_until") || "") || null;
  const aiSystemId = String(formData.get("ai_system_id") || "") || null;
  const file = formData.get("file");

  if (!title) throw new Error("Evidence title is required");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Evidence files must be 15 MB or smaller");
  }
  if (!evidenceMimeTypes.has(file.type)) {
    throw new Error("Unsupported evidence file type");
  }

  if (aiSystemId) {
    const { data: system } = await supabase
      .from("ai_systems")
      .select("id")
      .eq("id", aiSystemId)
      .eq("workspace_id", member.workspace_id)
      .maybeSingle();

    if (!system) throw new Error("Selected AI system is not in this workspace");
  }

  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "evidence";
  const folder = aiSystemId || "general";
  const storagePath =
    `${member.workspace_id}/${folder}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(storagePath, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("evidence_items").insert({
    workspace_id: member.workspace_id,
    ai_system_id: aiSystemId,
    title,
    evidence_type: "file",
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
    notes: notes || null,
    valid_until: validUntil,
    created_by: user.id,
  });

  if (insertError) {
    await supabase.storage.from("evidence").remove([storagePath]);
    throw insertError;
  }

  revalidatePath("/app/evidence");
  revalidatePath("/app/activity");
}

export async function deleteEvidence(formData: FormData) {
  const { supabase } = await authed();
  const id = String(formData.get("id") || "");

  if (!id) throw new Error("Evidence id is required");

  const { data: evidence, error: evidenceError } = await supabase
    .from("evidence_items")
    .select("id,storage_path")
    .eq("id", id)
    .single();

  if (evidenceError || !evidence) {
    throw evidenceError || new Error("Evidence not found");
  }

  if (evidence.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("evidence")
      .remove([evidence.storage_path]);

    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase
    .from("evidence_items")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  revalidatePath("/app/evidence");
  revalidatePath("/app/activity");
}
