import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  {
    title: "Product",
    links: [
      ["What's inside", "/#product"],
      ["Priority scoring", "/#scoring"],
      ["How it works", "/#how"],
      ["Pricing", "/#pricing"],
      ["Roadmap", "/#roadmap"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Security", "/#security"],
      ["Privacy notice", "/privacy"],
      ["Terms of service", "/terms"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Log in", "/login"],
      ["Create a free workspace", "/signup"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-slate-400">
            A living register of the AI your company uses, who owns it, and when it was last reviewed.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Aegistra organizes governance work. It is not legal advice, a certification or a legal risk classification.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-slate-200">{column.title}</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-400">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shell py-5 text-xs text-slate-500">
          Copyright 2026 Aegistra. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
