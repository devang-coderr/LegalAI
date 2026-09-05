"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const ARTICLES = [
  {
    category: "Legal AI",
    title: "The Future of Legal Research",
    description: "How retrieval-augmented models are reshaping how lawyers find precedent.",
    date: "Jun 2026",
  },
  {
    category: "Judicial Intelligence",
    title: "How AI Can Help Navigate Case Law",
    description: "Turning thousands of judgments into a navigable, citable knowledge graph.",
    date: "May 2026",
  },
  {
    category: "Legal Documents",
    title: "Understanding Complex Documents With AI",
    description: "Clause detection, risk flags and plain-language summaries for dense filings.",
    date: "Apr 2026",
  },
];

export function Insights() {
  return (
    <section id="insights" className="landing-root relative py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div className="space-y-3">
            <span className="lp-eyebrow">Insights</span>
            <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)]">
              Thinking, out loud.
            </h2>
          </div>
          <p className="text-sm text-[var(--lp-ink-dim)] max-w-sm">
            Notes on legal AI, judicial intelligence and the practice of law in an AI-assisted world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((a, i) => (
            <motion.article
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group lp-card rounded-2xl p-6 flex flex-col justify-between min-h-[220px] hover:border-[var(--lp-border-strong)] transition-colors cursor-pointer"
            >
              <div className="space-y-3">
                <span className="lp-eyebrow">{a.category}</span>
                <h3 className="text-lg font-semibold lp-font-display text-[var(--lp-ink)] leading-snug">
                  {a.title}
                </h3>
                <p className="text-xs text-[var(--lp-ink-dim)] leading-relaxed">{a.description}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--lp-border)]">
                <span className="text-[10px] uppercase tracking-widest text-[var(--lp-ink-faint)]">{a.date}</span>
                <ArrowUpRight className="w-4 h-4 text-[var(--lp-gold-light)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
