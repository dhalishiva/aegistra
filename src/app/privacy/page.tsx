import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Aegistra handles account information and AI-governance metadata. Draft notice for the early-stage product.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell py-12 md:py-16">
        <article className="mx-auto mt-12 max-w-3xl"><div className="kicker">Legal</div><h1 className="mt-2 text-4xl font-bold">Privacy notice</h1><div className="mt-8 space-y-5 leading-7 text-slate-300"><p>Aegistra is an early-stage SaaS product for organizing AI-governance metadata. This draft notice should be reviewed before commercial launch.</p><p>The service may process account information, workspace membership, AI-system metadata, review dates, action items and evidence references needed to operate the product.</p><p>Production prompts and model traffic are not required by the MVP. Access to workspace data is isolated through database-level authorization policies.</p><p>Contact details, retention periods, subprocessors, international transfers and user-rights procedures must be finalized before a paid public launch.</p></div></article>
      </main>
      <SiteFooter />
    </div>
  );
}
