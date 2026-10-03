import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Aegistra — AI governance for small teams", template: "%s | Aegistra" },
  description: "Keep a living register of AI systems, owners, reviews, actions and evidence without enterprise GRC complexity.",
  openGraph: {
    title: "Aegistra — Know where AI is used. Know who owns it.",
    description: "Lightweight AI governance for growing teams.",
    url: siteUrl,
    siteName: "Aegistra",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Aegistra", description: "Lightweight AI governance for growing teams." },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
