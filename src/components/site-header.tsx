import Link from "next/link";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

export const siteLinks = [
  ["Product", "/#product"],
  ["Scoring", "/#scoring"],
  ["How it works", "/#how"],
  ["Pricing", "/pricing"],
  ["Security", "/security"],
  ["Roadmap", "/#roadmap"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="container-shell relative flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Aegistra home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          {siteLinks.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-slate-200 transition hover:text-white md:inline-flex">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
            Start free
          </Link>
          <ThemeToggle />
          <MobileNav links={siteLinks} />
        </div>
      </div>
    </header>
  );
}
