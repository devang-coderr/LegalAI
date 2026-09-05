"use client";

import React from "react";
import { motion } from "framer-motion";
import { Accessibility, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

const PILLARS = [
  { icon: Accessibility, title: "Accessible", body: "Plain-language legal guidance for anyone, not just legal professionals." },
  { icon: ScanSearch, title: "Precise", body: "Every answer is grounded in retrievable statutes, sections and judgments." },
  { icon: Sparkles, title: "AI-Native", body: "Built around retrieval-augmented reasoning, not keyword search." },
  { icon: ShieldCheck, title: "Responsible", body: "Clear about what AI can and cannot decide in matters of law." },
];

export function AboutSection() {
  return (
    <section id="about" className="landing-root relative py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl space-y-5 mb-16">
          <span className="lp-eyebrow">About LegalAI</span>
          <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)] leading-tight">
            Built to make legal intelligence more accessible.
          </h2>
          <p className="text-sm sm:text-base text-[var(--lp-ink-dim)] leading-relaxed">
            The law is enormous, and most of it is written for people who already understand it.
            LegalAI exists to close that gap — connecting citizens and legal professionals to the
            same body of statutes, precedent and judgment, translated into something you can
            actually act on. We favor clarity over cleverness, and citation over speculation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="lp-card rounded-2xl p-6 space-y-3"
              >
                <Icon className="w-5 h-5 text-[var(--lp-gold-light)]" />
                <h3 className="text-sm font-semibold text-[var(--lp-ink)]">{p.title}</h3>
                <p className="text-xs text-[var(--lp-ink-dim)] leading-relaxed">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
