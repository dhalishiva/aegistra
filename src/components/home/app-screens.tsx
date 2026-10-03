import type { ReactNode } from "react";
import { AlertTriangle, Bot, CalendarClock, ListChecks } from "lucide-react";
import { sampleActions, sampleSystems } from "./sample-data";

/** Frame for a recreation of a real app screen. Always labelled as sample data. */
export function AppWindow({ path, children }: { path: string; children: ReactNode }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border-2 border-white bg-ink shadow-stamp">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 bg-panel px-4 py-2.5 text-xs text-slate-400">
        <span className="truncate">{path}</span>
        <span className="badge shrink-0">Sample data</span>
      </figcaption>
      <div className="p-4 sm:p-5">{children}</div>
    </figure>
  );
}

function PriorityBadge({ level, score }: { level: string; score: number }) {
  return (
    <span className={`badge badge-${level} capitalize`}>
      {level} · {score}
    </span>
  );
}

// The samples are written as of this date, so "reviews due" is derived rather than typed in.
const SAMPLE_TODAY = "2026-10-03";

export function OverviewScreen() {
  const highCount = sampleSystems.filter((system) => system.level === "high").length;
  const reviewsDue = sampleSystems.filter((system) => system.review && system.review <= SAMPLE_TODAY).length;

  const stats = [
    [Bot, "AI systems", sampleSystems.length],
    [AlertTriangle, "High priority", highCount],
    [CalendarClock, "Reviews due", reviewsDue],
    [ListChecks, "Open actions", sampleActions.length],
  ] as const;

  return (
    <AppWindow path="/app">
      <div className="text-sm font-semibold text-sky-300">Overview</div>
      <div className="mt-1 text-2xl font-bold">Northwind Studio</div>
      <p className="mt-1 text-sm text-slate-400">A living view of your AI systems, reviews and governance work.</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map(([Icon, label, value]) => (
          <div className="card p-3.5" key={label}>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
              <span>{label}</span>
              <Icon size={15} className="shrink-0 text-sky-300" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 card p-4">
        <div className="font-semibold">Systems needing attention</div>
        <ul className="mt-3 space-y-2">
          {sampleSystems.slice(0, 3).map((system) => (
            <li
              key={system.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/5 p-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{system.name}</div>
                <div className="truncate text-xs text-slate-500">
                  {system.provider} · {system.owner ?? "No owner"}
                </div>
              </div>
              <PriorityBadge level={system.level} score={system.score} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 card p-4">
        <div className="font-semibold">Open actions</div>
        <ul className="mt-3 space-y-3">
          {sampleActions.map((action) => (
            <li key={action.title} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-medium">{action.title}</div>
              <div className="text-xs text-slate-500">
                {action.owner} · due {action.due}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppWindow>
  );
}

export function ActionsScreen() {
  return (
    <AppWindow path="/app/actions">
      <div className="text-sm font-semibold text-sky-300">Workflow</div>
      <div className="mt-1 text-2xl font-bold">Governance actions</div>

      <div className="mt-5 card space-y-3 p-4">
        <div className="font-semibold">Add action</div>
        <div className="rounded-lg border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-500">
          Review vendor data retention terms
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-500">
            Owner
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-500">
            Due date
          </div>
        </div>
        <span className="btn-primary w-full">Create action</span>
      </div>

      <ul className="mt-4 space-y-2.5">
        {sampleActions.map((action, index) => (
          <li key={action.title} className="card flex items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <div className={index === 2 ? "text-sm text-slate-500 line-through" : "text-sm font-medium"}>
                {action.title}
              </div>
              <div className="text-xs text-slate-500">
                {action.owner} · due {action.due}
              </div>
            </div>
            {index === 2 ? (
              <span className="badge shrink-0 text-emerald-300">Done</span>
            ) : (
              <span className="btn-secondary shrink-0 px-3 py-1.5 text-sm">Mark done</span>
            )}
          </li>
        ))}
      </ul>
    </AppWindow>
  );
}

export function ReadinessScreen() {
  const withOwner = sampleSystems.filter((system) => system.owner).length;
  const withReview = sampleSystems.filter((system) => system.review).length;
  const stats = [
    ["Registered systems", sampleSystems.length],
    ["With owner", withOwner],
    ["With review date", withReview],
  ] as const;

  return (
    <AppWindow path="/app/evidence">
      <div className="text-sm font-semibold text-sky-300">Evidence</div>
      <div className="mt-1 text-2xl font-bold">Assurance readiness</div>
      <p className="mt-1 text-sm text-slate-400">Spot missing ownership and review evidence.</p>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {stats.map(([label, value]) => (
          <div className="card p-3.5" key={label}>
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>System</th>
              <th>Owner</th>
              <th className="whitespace-nowrap">Review date</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {[...sampleSystems]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((system) => (
                <tr key={system.name}>
                  <td className="min-w-[12rem] font-medium">{system.name}</td>
                  <td>
                    {system.owner ? (
                      <span className="text-emerald-300">Ready</span>
                    ) : (
                      <span className="text-amber-300">Missing</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{system.review ?? "Missing"}</td>
                  <td className="capitalize">{system.level}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </AppWindow>
  );
}
