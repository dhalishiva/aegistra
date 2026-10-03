import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071019]/80 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/"><Logo /></Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="/#product">Product</a>
          <a href="/#how">How it works</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#security">Security</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary hidden sm:inline-flex">Log in</Link>
          <Link href="/signup" className="btn-primary">Start free</Link>
        </div>
      </div>
    </header>
  );
}
