import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  Check,
  Circle,
  ListChecks,
  Plus,
} from "lucide-react";
import { getSessionContext } from "@/lib/workspace";
import { Reveal } from "@/components/motion";

export default async function Dashboard() {
  const { supabase, workspace } = await getSessionContext();

  const [systemsResult, actionsResult] = await Promise.all([
    supabase
      .from("ai_systems")
      .select("id,name,provider,priority_level,priority_score,review_due,owner_name,lifecycle")
      .eq("workspace_id", workspace.id)
      .order("priority_score", { ascending: false })
      .limit(8),
    supabase
      .from("action_items")
      .select("id,title,status,due_date,owner")
      .eq("workspace_id", workspace.id)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(6),
  ]);

  const systems = systemsResult.data ?? [];
  const actions = actionsResult.data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const high = systems.filter((item) => item.priority_level === "high").length;
  const due = systems.filter(
    (item) => item.review_due && item.review_due <= today
  ).length;

  const missingOwner = systems.filter((item) => !item.owner_name).length;
  const missingReview = systems.filter((item) => !item.review_due).length;
  const checklist = [
    {
      done: systems.length > 0,
      label: "Add your first AI system",
      hint: "Name it, say what it is for, and answer six questions.",
      href: "/app/systems/new",
    },
    {
      done: systems.length > 0 && missingOwner === 0,
      label: "Give every system an owner",
      hint: missingOwner ? `${missingOwner} without an owner.` : "Each system needs one named person.",
      href: "/app/systems",
    },
    {
      done: systems.length > 0 && missingReview === 0,
      label: "Set a review date on every system",
      hint: missingReview ? `${missingReview} without a review date.` : "Pick when each one is checked next.",
      href: "/app/systems",
    },
  ];
  const checklistDone = checklist.every((item) => item.done);

  const stats = [
    [Bot, "AI systems", systems.length],
    [AlertTriangle, "High priority", high],
    [CalendarClock, "Reviews due", due],
    [ListChecks, "Open actions", actions.length],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="kicker">Overview</div>
          <h1 className="mt-2 text-3xl font-bold">{workspace.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            A living view of your AI systems, reviews and governance work.
          </p>
        </div>
        <Link href="/app/systems/new" className="btn-primary gap-2">
          <Plus size={17} />
          Add AI system
        </Link>
      </div>

      {!checklistDone && (
        <section aria-label="Getting started" className="card-stamp mt-8 p-5">
          <h2 className="font-bold">Get your register ready</h2>
          <ul className="mt-3 divide-y divide-white/10">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-3 py-3 transition hover:text-sky-300">
                  {item.done ? (
                    <Check size={18} className="shrink-0 text-emerald-300" aria-label="Done" />
                  ) : (
                    <Circle size={18} className="shrink-0 text-slate-500" aria-label="To do" />
                  )}
                  <span className={item.done ? "text-slate-500 line-through" : "font-medium"}>{item.label}</span>
                  <span className="ml-auto hidden text-sm text-slate-500 sm:inline">{item.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([Icon, label, value], index) => (
          <Reveal delay={index * 0.06} key={label}>
          <div className="card p-5">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{label}</span>
              <Icon size={18} className="text-sky-300" />
            </div>
            <div className="mt-3 text-3xl font-bold">{value}</div>
          </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <section className="card p-5">
          <div className="flex justify-between">
            <h2 className="font-bold">Systems needing attention</h2>
            <Link href="/app/systems" className="text-sm text-sky-300">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {systems.length ? (
              systems.map((system) => (
                <Link
                  href={`/app/systems/${system.id}`}
                  key={system.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 p-4 transition hover:border-sky-400/30 hover:bg-white/[0.03]"
                >
                  <div>
                    <div className="font-semibold">{system.name}</div>
                    <div className="text-xs text-slate-500">
                      {system.provider || "Provider not set"} ·{" "}
                      {system.owner_name || "No owner"}
                    </div>
                  </div>
                  <span
                    className={`badge badge-${system.priority_level} capitalize`}
                  >
                    {system.priority_level} · {system.priority_score}
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
                No systems yet.
              </div>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Open actions</h2>
          <div className="mt-4 space-y-3">
            {actions.length ? (
              actions.map((action) => (
                <div key={action.id} className="border-b border-white/5 pb-3">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-slate-500">
                    {action.owner || "Unassigned"}
                    {action.due_date ? ` · due ${action.due_date}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No open actions.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
