"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.dataset.theme = theme;
}

export function setLegalTheme(theme: Theme) {
  localStorage.setItem("legalai-theme", theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent("legalai-theme-change", { detail: theme }));
}

export function getLegalTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("legalai-theme") as Theme) || "dark";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setTheme(getLegalTheme());
    sync();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads persisted theme after hydration
    setMounted(true);
    const onTheme = () => sync();
    window.addEventListener("legalai-theme-change", onTheme);
    return () => window.removeEventListener("legalai-theme-change", onTheme);
  }, []);

  if (!mounted) return <div className="h-9 w-9" />;

  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Moon : Sun;
  return (
    <button
      type="button"
      onClick={() => setLegalTheme(next)}
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} theme`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] hover:border-[var(--accent-gold)] transition-all ${className}`}
    >
      <motion.div initial={false} animate={{ rotate: theme === "dark" ? 0 : 180 }}>
        <Icon className={`h-4 w-4 ${theme === "dark" ? "text-[var(--accent-blue)]" : "text-[var(--accent-gold)]"}`} />
      </motion.div>
    </button>
  );
}

export function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") return <Sun className="h-5 w-5" />;
  if (theme === "system") return <Monitor className="h-5 w-5" />;
  return <Moon className="h-5 w-5" />;
}
