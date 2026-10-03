import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export function AuthShell({
  kicker,
  title,
  lede,
  children,
  footer,
  width = "max-w-md",
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  return (
    <main className="container-shell grid min-h-screen place-items-center py-12">
      <div className={`w-full ${width}`}>
        <Link href="/" aria-label="Aegistra home" className="inline-block">
          <Logo />
        </Link>
        <div className="card mt-7 p-6 sm:p-8">
          <div className="kicker">{kicker}</div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{lede}</p>
          {children}
        </div>
        {footer && <p className="mt-5 text-center text-sm text-slate-400">{footer}</p>}
      </div>
    </main>
  );
}
