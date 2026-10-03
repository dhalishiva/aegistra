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
        // Every colour below is a CSS variable so the whole app can switch between light and dark.
        white: "rgb(var(--fg) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        slate: {
          50: "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          950: "rgb(var(--slate-950) / <alpha-value>)",
        },
        sky: {
          50: "rgb(var(--sky-50) / <alpha-value>)",
          100: "rgb(var(--sky-100) / <alpha-value>)",
          200: "rgb(var(--sky-200) / <alpha-value>)",
          300: "rgb(var(--sky-300) / <alpha-value>)",
          400: "rgb(var(--sky-400) / <alpha-value>)",
        },
        emerald: {
          200: "rgb(var(--emerald-200) / <alpha-value>)",
          300: "rgb(var(--emerald-300) / <alpha-value>)",
          400: "rgb(var(--emerald-400) / <alpha-value>)",
        },
        amber: {
          100: "rgb(var(--amber-100) / <alpha-value>)",
          200: "rgb(var(--amber-200) / <alpha-value>)",
          300: "rgb(var(--amber-300) / <alpha-value>)",
          400: "rgb(var(--amber-400) / <alpha-value>)",
        },
        red: {
          200: "rgb(var(--red-200) / <alpha-value>)",
          300: "rgb(var(--red-300) / <alpha-value>)",
          400: "rgb(var(--red-400) / <alpha-value>)",
        },
        indigo: { 300: "rgb(var(--indigo-300) / <alpha-value>)" },
        // Priority levels. Used only where a value means high, medium or low.
        signal: {
          high: "rgb(var(--signal-high) / <alpha-value>)",
          medium: "rgb(var(--signal-medium) / <alpha-value>)",
          low: "rgb(var(--signal-low) / <alpha-value>)",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--sky-400) / .25)",
        stamp: "5px 5px 0 0 rgb(var(--fg))",
        "stamp-sm": "3px 3px 0 0 rgb(var(--fg))",
      },
    },
  },
  plugins: [],
};
export default config;
