import { getSessionContext } from "@/lib/workspace";

export default async function Evidence() {
  const { supabase, workspace } = await getSessionContext();

  const result = await supabase
    .from("ai_systems")
    .select("id,name,priority_level,owner_name,review_due")
    .eq("workspace_id", workspace.id)
    .order("name");

  const systems = result.data ?? [];

  const stats = [
    ["Registered systems", systems.length],
    ["With owner", systems.filter((system) => system.owner_name).length],
    ["With review date", systems.filter((system) => system.review_due).length],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="kicker">Evidence</div>
      <h1 className="mt-2 text-3xl font-black">Assurance readiness</h1>
      <p className="mt-2 text-sm text-slate-400">
        Spot missing ownership and review evidence. File uploads and evidence
        packs are planned next.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div className="card p-5" key={label}>
            <div className="text-3xl font-black">{value}</div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>System</th>
              <th>Owner</th>
              <th>Review date</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system.id}>
                <td className="font-medium">{system.name}</td>
                <td>
                  {system.owner_name ? (
                    <span className="text-emerald-300">Ready</span>
                  ) : (
                    <span className="text-amber-300">Missing</span>
                  )}
                </td>
                <td>{system.review_due || "Missing"}</td>
                <td className="capitalize">{system.priority_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
