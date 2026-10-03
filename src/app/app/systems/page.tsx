import Link from "next/link";
import { Plus } from "lucide-react";
import { SystemsCsvTools } from "@/components/systems-csv-tools";
import { getSessionContext } from "@/lib/workspace";

export default async function Systems() {
  const { supabase, workspace, membership } = await getSessionContext();
  const canWrite = membership.role !== "viewer";

  const result = await supabase
    .from("ai_systems")
    .select("id,name,provider,purpose,owner_name,lifecycle,priority_level,priority_score,review_due")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const systems = result.data ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="kicker">Register</div>
          <h1 className="mt-2 text-3xl font-black">AI systems</h1>
          <p className="mt-2 text-sm text-slate-400">
            Every AI-enabled system or business use your team relies on.
          </p>
        </div>
        {canWrite && (
          <Link href="/app/systems/new" className="btn-primary gap-2">
            <Plus size={17} />
            Add system
          </Link>
        )}
      </div>

      <SystemsCsvTools canImport={canWrite} />

      <div className="table-wrap mt-7">
        <table className="table">
          <thead>
            <tr>
              <th>System</th>
              <th>Owner</th>
              <th>Lifecycle</th>
              <th>Priority</th>
              <th>Review due</th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system.id}>
                <td>
                  <Link
                    href={`/app/systems/${system.id}`}
                    className="font-semibold text-white hover:text-sky-300"
                  >
                    {system.name}
                  </Link>
                  <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                    {system.provider || "—"} · {system.purpose}
                  </div>
                </td>
                <td>{system.owner_name || "—"}</td>
                <td className="capitalize">{system.lifecycle}</td>
                <td>
                  <span
                    className={`badge badge-${system.priority_level} capitalize`}
                  >
                    {system.priority_level} · {system.priority_score}
                  </span>
                </td>
                <td>{system.review_due || "Not set"}</td>
              </tr>
            ))}
            {!systems.length && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No systems yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
