import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingSection } from "@/components/home/shared";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Aegistra is free for your first 3 AI systems. Team ($49/month) and Business ($149/month) plans are planned; billing is not live yet.",
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
