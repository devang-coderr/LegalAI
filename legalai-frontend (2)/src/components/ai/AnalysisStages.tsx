"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STAGES = [
  "Understanding your problem",
  "Finding relevant legal issues",
  "Searching relevant law",
  "Finding similar precedents",
  "Preparing your result",
];

export function AnalysisStages({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STAGES.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), 750);
    return () => clearTimeout(t);
  }, [current, onComplete]);

  return (
    <div className="mx-auto max-w-sm space-y-3">
      {STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={stage} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                done
                  ? "border-[var(--azure)] bg-[var(--azure)] text-white"
                  : active
                  ? "border-[var(--azure)] text-[var(--azure)]"
                  : "border-[var(--surface-border)] text-transparent"
              }`}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <Check className="h-3 w-3" />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
              </AnimatePresence>
            </span>
            <span
              className={
                done || active ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"
              }
            >
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}
