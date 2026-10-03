import type { SupabaseClient } from "@supabase/supabase-js";

export type PackSystem = {
  id: string; name: string; provider: string | null; purpose: string;
  owner_name: string | null; owner_email: string | null; lifecycle: string;
  data_sensitivity: string; autonomy: string; impact: string;
  human_review: boolean; public_interaction: boolean; generates_content: boolean;
  priority_score: number; priority_level: string;
  review_due: string | null; last_reviewed: string | null; notes: string | null;
};
export type PackReview = { ai_system_id: string; outcome: string; notes: string | null; reviewed_at: string; next_review_due: string | null };
export type PackAction = { ai_system_id: string | null; title: string; owner: string | null; due_date: string | null; status: string; completed_at: string | null };
export type PackEvidence = { ai_system_id: string | null; title: string; evidence_type: string; file_name: string | null; url: string | null; notes: string | null; valid_until: string | null; created_at: string };

export type AssurancePack = {
  workspaceName: string;
  generatedAt: Date;
  systems: PackSystem[];
  reviews: PackReview[];
  actions: PackAction[];
  evidence: PackEvidence[];
};

export async function loadAssurancePack(supabase: SupabaseClient, workspace: { id: string; name: string }): Promise<AssurancePack | null> {
  const [s, r, a, e] = await Promise.all([
    supabase.from("ai_systems")
      .select("id,name,provider,purpose,owner_name,owner_email,lifecycle,data_sensitivity,autonomy,impact,human_review,public_interaction,generates_content,priority_score,priority_level,review_due,last_reviewed,notes")
      .eq("workspace_id", workspace.id).order("priority_score", { ascending: false }),
    supabase.from("system_reviews").select("ai_system_id,outcome,notes,reviewed_at,next_review_due")
      .eq("workspace_id", workspace.id).order("reviewed_at", { ascending: false }),
    supabase.from("action_items").select("ai_system_id,title,owner,due_date,status,completed_at")
      .eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("evidence_items").select("ai_system_id,title,evidence_type,file_name,url,notes,valid_until,created_at")
      .eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
  ]);
  if (s.error || r.error || a.error || e.error) return null;
  return {
    workspaceName: workspace.name,
    generatedAt: new Date(),
    systems: (s.data ?? []) as PackSystem[],
    reviews: (r.data ?? []) as PackReview[],
    actions: (a.data ?? []) as PackAction[],
    evidence: (e.data ?? []) as PackEvidence[],
  };
}

const today = (d: Date) => d.toISOString().slice(0, 10);

export function packStats(pack: AssurancePack) {
  const now = today(pack.generatedAt);
  return {
    systems: pack.systems.length,
    high: pack.systems.filter((x) => x.priority_level === "high").length,
    medium: pack.systems.filter((x) => x.priority_level === "medium").length,
    low: pack.systems.filter((x) => x.priority_level === "low").length,
    overdue: pack.systems.filter((x) => x.review_due && x.review_due < now).length,
    noOwner: pack.systems.filter((x) => !x.owner_name?.trim() && !x.owner_email?.trim()).length,
    openActions: pack.actions.filter((x) => x.status !== "done").length,
    overdueActions: pack.actions.filter((x) => x.status !== "done" && x.due_date && x.due_date < now).length,
    evidence: pack.evidence.length,
    expiredEvidence: pack.evidence.filter((x) => x.valid_until && x.valid_until < now).length,
    withoutEvidence: pack.systems.filter((x) => !pack.evidence.some((ev) => ev.ai_system_id === x.id)).length,
  };
}

export type CsvDataset = "register" | "reviews" | "actions" | "evidence";

export function packCsvRows(pack: AssurancePack, dataset: CsvDataset): { headers: string[]; rows: Record<string, unknown>[] } {
  const nameOf = (id: string | null) => pack.systems.find((x) => x.id === id)?.name ?? "";
  if (dataset === "reviews") {
    return {
      headers: ["system", "outcome", "reviewed_at", "next_review_due", "notes"],
      rows: pack.reviews.map((r) => ({ system: nameOf(r.ai_system_id), outcome: r.outcome, reviewed_at: r.reviewed_at.slice(0, 10), next_review_due: r.next_review_due, notes: r.notes })),
    };
  }
  if (dataset === "actions") {
    return {
      headers: ["system", "title", "owner", "due_date", "status", "completed_at"],
      rows: pack.actions.map((a) => ({ system: nameOf(a.ai_system_id), title: a.title, owner: a.owner, due_date: a.due_date, status: a.status, completed_at: a.completed_at?.slice(0, 10) })),
    };
  }
  if (dataset === "evidence") {
    return {
      headers: ["system", "title", "type", "file_name", "url", "valid_until", "added", "notes"],
      rows: pack.evidence.map((e) => ({ system: nameOf(e.ai_system_id), title: e.title, type: e.evidence_type, file_name: e.file_name, url: e.url, valid_until: e.valid_until, added: e.created_at.slice(0, 10), notes: e.notes })),
    };
  }
  const now = today(pack.generatedAt);
  return {
    headers: ["name", "provider", "purpose", "owner_name", "owner_email", "lifecycle", "data_sensitivity", "autonomy", "impact", "human_review", "public_interaction", "generates_content", "priority_score", "priority_level", "last_reviewed", "review_due", "review_overdue", "latest_review_outcome", "open_actions", "evidence_items", "notes"],
    rows: pack.systems.map((s) => {
      const latest = pack.reviews.find((r) => r.ai_system_id === s.id);
      return {
        ...s,
        review_overdue: s.review_due && s.review_due < now ? "yes" : "no",
        latest_review_outcome: latest?.outcome ?? "",
        open_actions: pack.actions.filter((a) => a.ai_system_id === s.id && a.status !== "done").length,
        evidence_items: pack.evidence.filter((e) => e.ai_system_id === s.id).length,
      };
    }),
  };
}
