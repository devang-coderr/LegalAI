"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type Stat = {
  target: number;
  prefix?: string;
  suffix: string;
  label: string;
  detail: string;
  decimals?: number;
};

const STATS: Stat[] = [
  { target: 500000, suffix: "+", label: "Indexed Judgments", detail: "Supreme Court & High Courts" },
  { target: 99.4, suffix: "%", decimals: 1, label: "Citation Precision", detail: "Ratio decidendi matching" },
  { target: 5, prefix: "< ", suffix: " sec", label: "OCR Processing", detail: "Clause & risk extraction" },
  { target: 10000, suffix: "+", label: "Legal Workspaces", detail: "Citizens & advocates" },
];

function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function StatCounter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reducedMotion) {
      raf = requestAnimationFrame(() => setDisplay(stat.target));
      return () => cancelAnimationFrame(raf);
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(stat.target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(stat.target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.target]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="lp-stat lp-card rounded-2xl p-6 sm:p-7 text-center space-y-1.5 hover:border-[var(--lp-border-strong)] transition-colors"
    >
      <h3 className="lp-stat-value text-2xl sm:text-4xl font-semibold lp-font-display lp-gold-text tabular-nums transition-[text-shadow] duration-300">
        {stat.prefix ?? ""}
        {formatNumber(display, stat.decimals ?? 0)}
        {stat.suffix}
      </h3>
      <p className="text-xs font-semibold text-[var(--lp-ink)]">{stat.label}</p>
      <p className="text-[10px] text-[var(--lp-ink-faint)] transition-colors group-hover:text-[var(--lp-ink-dim)]">
        {stat.detail}
      </p>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="landing-root relative py-20 sm:py-28 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat) => (
            <StatCounter key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
