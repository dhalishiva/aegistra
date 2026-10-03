import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingSection } from "@/components/home/shared";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Aegistra is free for your first 3 AI systems. Team is $5 a month for up to 50 systems and Business is $10 a month with no limit.",
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  return (
    <div>
      <SiteHeader />
      <main>
        <PricingSection asPage />
      </main>
      <SiteFooter />
    </div>
  );
}
