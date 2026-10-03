import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { SideNav, TopNav } from "./app-nav";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children, workspaceName }: { children: ReactNode; workspaceName: string }) {
  return (
    <div className="min-h-screen bg-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-panel p-4 lg:block">
        <div className="flex items-center justify-between px-2 py-2"><Logo /><ThemeToggle className="h-9 w-9" /></div>
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="text-xs text-slate-400">Workspace</div>
          <div className="mt-1 truncate font-semibold">{workspaceName}</div>
        </div>
        <SideNav />
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 p-3 text-xs leading-5 text-slate-400">
          <div className="mb-1 flex items-center gap-2 font-semibold text-slate-200"><ShieldCheck size={15} aria-hidden="true" /> Not legal advice</div>
          Aegistra organizes governance work. It does not certify compliance.
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-white/10 bg-ink px-5 py-3 lg:hidden">
          <div className="flex items-center justify-between"><Logo /><ThemeToggle className="h-9 w-9" /></div>
          <TopNav />
        </div>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
