"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("aegistra-theme", next);
    } catch {
      /* private mode: the choice just won't persist */
    }
    setTheme(next);
  }

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-white/25 bg-card text-white transition hover:bg-white/5 ${className}`}
    >
      {theme === null ? <span className="h-[18px] w-[18px]" /> : dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
