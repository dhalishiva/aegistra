export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-sky-300/30 bg-gradient-to-br from-sky-400/25 to-indigo-500/20 shadow-glow">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path d="M16 3 26 7v7c0 7-4.4 11.8-10 15-5.6-3.2-10-8-10-15V7l10-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-sky-300"/>
          <circle cx="11" cy="12" r="2" className="fill-indigo-300"/>
          <circle cx="21" cy="12" r="2" className="fill-sky-300"/>
          <circle cx="16" cy="20" r="2" className="fill-emerald-300"/>
          <path d="m12.7 13.1 2.1 5.1m4.5-5.1-2.1 5.1M13 12h6" stroke="currentColor" strokeWidth="1.4" className="text-slate-200"/>
        </svg>
      </div>
      {!compact && <span className="text-lg font-black tracking-tight">Aegistra</span>}
    </div>
  );
}
