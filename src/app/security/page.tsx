import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SecuritySection } from "@/components/home/shared";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Aegistra stores AI-governance metadata, not prompts or model traffic. Workspaces are isolated with row-level security in Postgres.",
  alternates: { canonical: "/security" },
};

export default function Security() {
  return (
    <div>
      <SiteHeader />
      <main>
        <SecuritySection asPage />
      </main>
      <SiteFooter />
    </div>
  );
}
