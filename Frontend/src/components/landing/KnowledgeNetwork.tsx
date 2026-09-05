"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type NodeDef = {
  id: string;
  label: string;
  sub?: string;
  x: number; // % across a 100 x 74 organic canvas
  y: number;
  size: "core" | "lg" | "md" | "sm" | "xs";
  relevant: boolean;
  parent?: string; // draws a secondary thread from this node instead of the core
  float?: boolean;
};

const NODES: NodeDef[] = [
  { id: "case", label: "Your Case", x: 47, y: 42, size: "core", relevant: true },
  { id: "judgment", label: "Judgment", sub: "2019 · 96% match", x: 21, y: 16, size: "lg", relevant: true, float: true },
  { id: "judgment-cite", label: "Citation", x: 9, y: 40, size: "sm", relevant: true, parent: "judgment" },
  { id: "article", label: "Article 21", x: 80, y: 14, size: "md", relevant: true, float: true },
  { id: "section", label: "Section 420", x: 87, y: 48, size: "md", relevant: true },
  { id: "precedent", label: "Precedent", sub: "91% match", x: 30, y: 74, size: "lg", relevant: true, float: true },
  { id: "precedent-cite", label: "Citation", x: 54, y: 84, size: "sm", relevant: true, parent: "precedent" },
  { id: "misc-1", label: "Circular 12/07", x: 7, y: 66, size: "xs", relevant: false },
  { id: "misc-2", label: "Draft note", x: 91, y: 78, size: "xs", relevant: false },
];

const SIZE_PX: Record<NodeDef["size"], number> = { core: 92, lg: 30, md: 26, sm: 18, xs: 12 };

function edgeFor(node: NodeDef) {
  const source = NODES.find((n) => n.id === (node.parent ?? "case"))!;
  return { x1: source.x, y1: source.y, x2: node.x, y2: node.y };
}

export function KnowledgeNetwork() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const controls = useAnimation();
  const [resolved, setResolved] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!inView) return;
    controls.start("visible");
    const settleDelay = reducedMotion ? 400 : 2600;
    const t = setTimeout(() => setResolved(true), settleDelay);
    return () => clearTimeout(t);
  }, [inView, controls, reducedMotion]);

  return (
    <section className="landing-root relative py-24 sm:py-32 px-4 sm:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="lp-eyebrow">Legal RAG, Visualized</span>
          <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)]">
            The law is connected.
          </h2>
          <p className="text-sm text-[var(--lp-ink-dim)]">
            Every case pulls in judgments, sections, articles and citations — then quietly
            lets go of everything that doesn&apos;t matter.
          </p>
        </div>

        <div ref={ref} className="relative w-full max-w-3xl mx-auto aspect-square sm:aspect-[4/3]">
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle at 47% 42%, var(--lp-gold-glow), transparent 60%)" }}
          />

          <svg viewBox="0 0 100 74" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
            {NODES.filter((n) => n.id !== "case").map((node, i) => {
              const { x1, y1, x2, y2 } = edgeFor(node);
              const length = Math.hypot(x2 - x1, y2 - y1) * 4;
              return (
                <motion.line
                  key={node.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--lp-gold)"
                  strokeWidth={node.relevant ? 0.28 : 0.14}
                  strokeDasharray={length}
                  initial={{ strokeDashoffset: length, opacity: 0 }}
                  animate={
                    inView
                      ? {
                          strokeDashoffset: 0,
                          opacity: node.relevant ? (resolved ? 0.55 : 0.4) : resolved ? 0.12 : 0.22,
                        }
                      : {}
                  }
                  transition={{
                    strokeDashoffset: { duration: 0.9, delay: 0.5 + i * 0.16, ease: "easeInOut" },
                    opacity: { duration: 0.8, delay: resolved ? 0 : 0.5 + i * 0.16 },
                  }}
                />
              );
            })}
          </svg>

          {NODES.map((node, i) => {
            const px = SIZE_PX[node.size];
            const isCore = node.size === "core";
            const appearDelay = isCore ? 0 : 0.35 + i * 0.16;
            const dim = !node.relevant && resolved;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={
                  inView
                    ? {
                        opacity: dim ? 0.32 : 1,
                        scale: 1,
                        y: node.float && !reducedMotion ? [0, -5, 0] : 0,
                      }
                    : {}
                }
                transition={{
                  opacity: { duration: 0.6, delay: dim ? 0 : appearDelay },
                  scale: { duration: 0.6, delay: appearDelay, ease: [0.16, 1, 0.3, 1] },
                  y: node.float && !reducedMotion
                    ? { duration: 4 + i * 0.4, delay: appearDelay + 1, repeat: Infinity, ease: "easeInOut" }
                    : undefined,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${node.x}%`, top: `${node.y}%`, filter: dim ? "blur(0.5px)" : "none" }}
              >
                {isCore ? (
                  <div
                    className="relative flex items-center justify-center rounded-full lp-card border-[var(--lp-border-strong)]"
                    style={{ width: px, height: px }}
                  >
                    <motion.div
                      className="absolute -inset-3 rounded-full blur-xl"
                      style={{ background: "var(--lp-gold-glow)" }}
                      animate={reducedMotion ? {} : { opacity: [0.5, 0.85, 0.5] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative text-center text-xs sm:text-sm font-semibold lp-font-display text-[var(--lp-gold-light)] px-2">
                      {resolved ? "Legal Insight" : "Your Case"}
                    </span>
                  </div>
                ) : (
                  <div
                    className="lp-card rounded-full flex items-center justify-center text-center px-2 border-[var(--lp-border)]"
                    style={{
                      width: px * (node.sub ? 2.6 : 2.1),
                      height: px,
                      borderColor: node.relevant ? "var(--lp-border-strong)" : undefined,
                    }}
                  >
                    <div className="leading-tight">
                      <div
                        className="font-semibold tracking-wide text-[var(--lp-ink-dim)]"
                        style={{ fontSize: node.size === "sm" || node.size === "xs" ? "8px" : "9.5px" }}
                      >
                        {node.label.toUpperCase()}
                      </div>
                      {node.sub && (
                        <div className="text-[7px] text-[var(--lp-gold-light)] mt-0.5">{node.sub}</div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
