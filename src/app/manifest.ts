import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aegistra",
    short_name: "Aegistra",
    description: "A living register of the AI your company uses, who owns it, and when it was last reviewed.",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF1F8",
    theme_color: "#2B4EFF",
    icons: [
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
