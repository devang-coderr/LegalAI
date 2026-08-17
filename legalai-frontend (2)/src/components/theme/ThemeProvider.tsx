"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (originX: number, originY: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render always agree on "dark" (matches the
  // <html data-theme="dark"> default in layout.tsx + suppressHydrationWarning)
  // to avoid a hydration mismatch; the stored preference is then applied
  // immediately after mount, before paint.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("legalai-theme") as Theme | null;
    if (stored && stored !== "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount, not derivable during render
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = useCallback(
    (originX: number, originY: number) => {
      const next = theme === "dark" ? "light" : "dark";

      const applyTheme = () => {
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        window.localStorage.setItem("legalai-theme", next);
      };

      // Circular reveal transition via View Transitions API where supported.
      const docWithTransitions = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };

      if (docWithTransitions.startViewTransition) {
        document.documentElement.style.setProperty("--reveal-x", `${originX}px`);
        document.documentElement.style.setProperty("--reveal-y", `${originY}px`);
        const transition = docWithTransitions.startViewTransition(applyTheme);
        transition.ready.then(() => {
          const endRadius = Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY)
          );
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${originX}px ${originY}px)`,
                `circle(${endRadius}px at ${originX}px ${originY}px)`,
              ],
            },
            {
              duration: 650,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        });
      } else {
        applyTheme();
      }
    },
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
