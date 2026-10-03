import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, Bot, ListChecks, FolderArchive, History, Settings, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";

const links = [
  ["Overview", "/app", LayoutDashboard],
  ["AI systems", "/app/systems", Bot],
  ["Actions", "/app/actions", ListChecks],
  ["Evidence", "/app/evidence", FolderArchive],
  ["Activity", "/app/activity", History],
  ["Settings", "/app/settings", Settings],
] as const;

export function AppShell({ children, workspaceName }: { children: ReactNode; workspaceName: string }) {
  return (
    <div className="min-h-screen bg-[#071019]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#09131d] p-4 lg:block">
        <div className="px-2 py-2"><Logo /></div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <div className="text-xs text-slate-500">Workspace</div>
          <div className="mt-1 truncate font-semibold">{workspaceName}</div>
        </div>
        <nav className="mt-5 space-y-1">
          {links.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-sky-400/15 bg-sky-400/[0.06] p-3 text-xs text-slate-400">
          <div className="mb-1 flex items-center gap-2 font-semibold text-sky-300"><ShieldCheck size={15}/> Governance note</div>
          Aegistra organizes evidence and workflows. It does not provide legal advice.
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-white/10 bg-[#071019]/95 px-5 py-3 lg:hidden">
          <Logo />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {links.map(([label, href]) => <Link key={href} href={href} className="badge whitespace-nowrap">{label}</Link>)}
          </div>
        </div>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
