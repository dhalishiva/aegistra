import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !admins.includes(user.email.toLowerCase())) {
    redirect("/app");
  }

  const admin = createAdminClient();

  const [workspacesResult, systemsResult, membersResult, recentResult] =
    await Promise.all([
      admin.from("workspaces").select("*", { count: "exact", head: true }),
      admin.from("ai_systems").select("*", { count: "exact", head: true }),
      admin.from("workspace_members").select("*", { count: "exact", head: true }),
      admin
        .from("workspaces")
        .select("id,name,plan,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const recent = recentResult.data ?? [];

  return (
    <main className="container-shell py-8">
      <Logo />
      <div className="mt-8 kicker">Platform admin</div>
      <h1 className="mt-2 text-3xl font-bold">Aegistra control room</h1>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[
          ["Workspaces", workspacesResult.count ?? 0],
          ["Registered AI systems", systemsResult.count ?? 0],
          ["Memberships", membersResult.count ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="card p-5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Plan</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((workspace) => (
              <tr key={workspace.id}>
                <td>{workspace.name}</td>
                <td>{workspace.plan}</td>
                <td>{new Date(workspace.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
