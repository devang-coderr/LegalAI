"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NODES = [
  { id: "case", label: "Case", desc: "Your situation, in plain language.", x: 60, y: 200 },
  { id: "facts", label: "Facts", desc: "What actually happened, extracted and structured.", x: 220, y: 90 },
  { id: "law", label: "Law", desc: "The statutes and sections that govern it.", x: 400, y: 200 },
  { id: "precedent", label: "Precedent", desc: "Judgments that answered a similar question.", x: 580, y: 90 },
  { id: "judgment", label: "Judgment", desc: "How courts have ruled, and why.", x: 740, y: 200 },
];

const EDGES: [string, string][] = [
  ["case", "facts"],
  ["facts", "law"],
  ["law", "precedent"],
  ["precedent", "judgment"],
  ["case", "law"],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function KnowledgeNetwork() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="network" className="relative bg-[var(--void)] px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--azure)]">
          How LegalAI reasons
        </p>
        <h2 className="mt-4 text-balance font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
          A trail from your case to the law behind it
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-[var(--ink-muted)]">
          Every answer LegalAI gives is traceable — from the facts you describe, to
          the governing law, to the judgments that set the precedent.
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl overflow-x-auto">
        <svg viewBox="0 0 800 280" className="mx-auto w-full min-w-[720px]" fill="none">
          {EDGES.map(([from, to]) => {
            const a = nodeById(from);
            const b = nodeById(to);
            const isLit = active === from || active === to;
            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--surface-border)"
                  strokeWidth="1.5"
                />
                <motion.circle
                  r="2.5"
                  fill="var(--azure)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isLit ? 1 : 0.5,
                    cx: [a.x, b.x],
                    cy: [a.y, b.y],
                  }}
                  transition={{
                    cx: { duration: 3, repeat: Infinity, ease: "linear" },
                    cy: { duration: 3, repeat: Infinity, ease: "linear" },
                  }}
                />
              </g>
            );
          })}

          {NODES.map((node) => {
            const isActive = active === node.id;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setActive(node.id)}
                onMouseLeave={() => setActive(null)}
                className="cursor-pointer"
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? 26 : 20}
                  fill="var(--surface-2)"
                  stroke={isActive ? "var(--azure)" : "var(--surface-border)"}
                  strokeWidth="1.5"
                  animate={{ r: isActive ? 26 : 20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
                <text
                  x={node.x}
                  y={node.y + 46}
                  textAnchor="middle"
                  className={cn(
                    "font-[family-name:var(--font-sans)] text-[13px] font-medium transition-colors",
                    isActive ? "fill-[var(--azure)]" : "fill-[var(--ink-muted)]"
                  )}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mx-auto mt-6 h-12 max-w-md text-center text-sm text-[var(--ink-muted)]">
          {active ? nodeById(active).desc : "Hover a node to trace the reasoning."}
        </div>
      </div>
    </section>
  );
}
