import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Public, indexable pages only. Sign-in screens are noindex and left out on purpose.
// Update the date when a page's content really changes.
const pages: { path: string; lastModified: string; priority: number }[] = [
  { path: "", lastModified: "2026-10-03", priority: 1 },
  { path: "/pricing", lastModified: "2026-10-03", priority: 0.8 },
  { path: "/security", lastModified: "2026-10-03", priority: 0.8 },
  { path: "/privacy", lastModified: "2026-10-03", priority: 0.3 },
  { path: "/terms", lastModified: "2026-10-03", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return pages.map(({ path, lastModified, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(lastModified),
    changeFrequency: "monthly",
    priority,
  }));
}
