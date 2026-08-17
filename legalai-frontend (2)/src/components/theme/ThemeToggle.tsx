"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={(e) => toggleTheme(e.clientX, e.clientY)}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface)]/60 text-[var(--ink-muted)] transition-colors duration-300 hover:text-[var(--azure)] hover:border-[var(--azure)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--azure)] focus-visible:outline-offset-2"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}
