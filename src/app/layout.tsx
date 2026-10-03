import type { Metadata, Viewport } from "next";
import { NavProgress } from "@/components/nav-progress";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { getSiteUrl } from "@/lib/site-url";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "./globals.css";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1016" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aegistra — AI governance for small teams",
    template: "%s | Aegistra",
  },
  applicationName: "Aegistra",
  keywords: ["AI governance", "AI register", "AI inventory", "AI risk register", "AI vendor questionnaire"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the theme before first paint so there is no flash. Light is the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('aegistra-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
      </head>
      <body>
        <NavProgress />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
