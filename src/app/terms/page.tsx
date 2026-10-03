import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Draft terms of service for the Aegistra AI-governance register.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell py-12 md:py-16">
        <article className="mx-auto mt-12 max-w-3xl"><div className="kicker">Legal</div><h1 className="mt-2 text-4xl font-bold">Terms of service</h1><div className="mt-8 space-y-5 leading-7 text-slate-300"><p>These are draft MVP terms and must be reviewed before paid commercial use.</p><p>Aegistra helps organize AI-governance records and workflows. It is not legal advice, certification, regulatory approval or an automated statutory risk classification service.</p><p>Customers are responsible for the accuracy of information entered and for their own legal, regulatory and contractual obligations.</p><p>Service availability, billing, acceptable use, liability, termination and governing-law clauses should be finalized before launch.</p></div></article>
      </main>
      <SiteFooter />
    </div>
  );
}
