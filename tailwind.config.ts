import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Bricolage Grotesque Variable"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        // Page surfaces
        ink: "#0a1016",
        panel: "#101922",
        // Priority levels. Used only where a value means high, medium or low.
        signal: {
          high: "#ff7b5c",
          medium: "#f2b84b",
          low: "#4cd3a0",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(85,196,245,.18)",
      },
    },
  },
  plugins: [],
};
export default config;
