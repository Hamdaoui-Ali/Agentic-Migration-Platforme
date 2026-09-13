"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`mf-theme-toggle inline-flex items-center rounded-full border p-0.5 ${className}`}
      aria-label="Choose color theme"
      role="group"
    >
      <button
        type="button"
        aria-label="Use light theme"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        className="mf-focus inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-colors"
      >
        <Sun aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        aria-label="Use dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        className="mf-focus inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-colors"
      >
        <Moon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}

