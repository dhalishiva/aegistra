import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return ["", "/privacy", "/terms", "/login", "/signup"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
