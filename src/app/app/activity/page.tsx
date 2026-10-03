import Link from "next/link";
import { Activity, ArrowUpRight, FileText, ListChecks, ShieldCheck } from "lucide-react";
import { getSessionContext } from "@/lib/workspace";

const actionLabels: Record<string, string> = {
  "ai_system.created": "AI system added",
  "ai_system.updated": "AI system updated",
  "ai_system.reviewed": "AI system reviewed",
  "action.created": "Action created",
  "action.updated": "Action updated",
  "action.completed": "Action completed",
  "evidence.uploaded": "Evidence uploaded",
  "evidence.deleted": "Evidence deleted",
};

function destination(entityType: string, entityId: string | null) {
  if (entityType === "ai_system" && entityId) {
    return `/app/systems/${entityId}`;
  }
  if (entityType === "evidence") return "/app/evidence";
  if (entityType === "action_item") return "/app/actions";
  return null;
}

function EventIcon({ entityType }: { entityType: string }) {
  if (entityType === "evidence") return <FileText size={16} />;
  if (entityType === "action_item") return <ListChecks size={16} />;
  return <ShieldCheck size={16} />;
}

export default async function ActivityPage() {
  const { supabase, workspace } = await getSessionContext();

  const result = await supabase
    .from("activity_events")
    .select(
      "id,actor_email,action,entity_type,entity_id,entity_name,metadata,created_at"
    )
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const events = result.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="kicker">Audit trail</div>
      <h1 className="mt-2 text-3xl font-black">Workspace activity</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        An append-only timeline of important governance changes. Events are
        written automatically by the database when systems, reviews, actions or
        evidence change.
      </p>

      <div className="card mt-7">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-bold">Recent events</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing the latest {Math.min(events.length, 100)} events
            </p>
          </div>
          <Activity size={18} className="text-sky-300" />
        </div>

        <div className="divide-y divide-white/10">
          {events.length ? (
            events.map((event) => {
              const href = destination(event.entity_type, event.entity_id);
              const metadata =
                event.metadata && typeof event.metadata === "object"
                  ? (event.metadata as Record<string, unknown>)
                  : {};

              return (
                <div key={event.id} className="flex gap-4 px-5 py-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-sky-300">
                    <EventIcon entityType={event.entity_type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-medium">
                        {actionLabels[event.action] || event.action}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      {event.entity_name || "Workspace item"}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{event.actor_email || "System"}</span>

                      {typeof metadata.outcome === "string" && (
                        <span className="badge capitalize">
                          {metadata.outcome.replace("_", " ")}
                        </span>
                      )}

                      {typeof metadata.priority_level === "string" && (
                        <span className="badge capitalize">
                          {metadata.priority_level} priority
                        </span>
                      )}

                      {typeof metadata.status === "string" && (
                        <span className="badge capitalize">
                          {metadata.status.replace("_", " ")}
                        </span>
                      )}

                      {href && (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200"
                        >
                          Open
                          <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500">
              Activity will appear here as your team works in Aegistra.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
