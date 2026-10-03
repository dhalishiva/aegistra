"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { LayoutDashboard, Bot, ListChecks, FolderArchive, History, Settings } from "lucide-react";

const links: readonly [string, string, ComponentType<{ size?: number }>][] = [
  ["Overview", "/app", LayoutDashboard],
  ["AI systems", "/app/systems", Bot],
  ["Actions", "/app/actions", ListChecks],
  ["Evidence", "/app/evidence", FolderArchive],
  ["Activity", "/app/activity", History],
  ["Settings", "/app/settings", Settings],
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="App" className="mt-5 space-y-1">
      {links.map(([label, href, Icon]) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active ? "bg-sky-400/10 font-semibold text-sky-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={17} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="App" className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {links.map(([label, href]) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`badge whitespace-nowrap px-3 py-1.5 text-sm ${active ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
