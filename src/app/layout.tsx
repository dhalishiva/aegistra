import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { getSiteUrl } from "@/lib/site-url";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aegistra — AI governance for small teams",
    template: "%s | Aegistra",
  },
  description:
    "Keep a living register of AI systems, owners, reviews, actions and evidence without enterprise GRC complexity.",
  openGraph: {
    title: "Aegistra — Know where AI is used. Know who owns it.",
    description: "Lightweight AI governance for growing teams.",
    url: siteUrl,
    siteName: "Aegistra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegistra",
    description: "Lightweight AI governance for growing teams.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
