import { createClient } from "@/lib/supabase-server";
import { AI_SYSTEM_EXPORT_HEADERS, serializeCsv } from "@/lib/csv";

function safeFileName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "workspace"
  );
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id,workspace:workspaces(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.workspace_id) {
    return new Response("Workspace not found", { status: 404 });
  }

  const workspace = Array.isArray(membership.workspace)
    ? membership.workspace[0]
    : membership.workspace;

  const { data: systems, error } = await supabase
    .from("ai_systems")
    .select(
      "name,provider,purpose,owner_name,owner_email,lifecycle,data_sensitivity,autonomy,impact,human_review,public_interaction,generates_content,review_due,notes,priority_score,priority_level,last_reviewed"
    )
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response("Could not export AI systems", { status: 500 });
  }

  const csv = serializeCsv(AI_SYSTEM_EXPORT_HEADERS, systems ?? []);
  const workspaceName = workspace?.name || "workspace";
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFileName(workspaceName)}-aegistra-ai-systems-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
