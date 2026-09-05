"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquareText, BrainCircuit, SearchCode, Link2, FileCheck2 } from "lucide-react";

const STEPS = [
  { code: "01", title: "Ask", icon: MessageSquareText, body: "Describe your legal problem in plain language — no legal jargon required." },
  { code: "02", title: "Understand", icon: BrainCircuit, body: "AI parses the context, facts and intent behind the question." },
  { code: "03", title: "Retrieve", icon: SearchCode, body: "Relevant laws, sections and judgments are retrieved from the corpus." },
  { code: "04", title: "Connect", icon: Link2, body: "Cases, sections and precedents are linked into a coherent thread." },
  { code: "05", title: "Explain", icon: FileCheck2, body: "The result is presented clearly, with citations you can verify." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-root relative py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="lp-eyebrow">Process</span>
          <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)]">
            How LegalAI thinks.
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 lp-hairline" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.code}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative flex flex-col items-start md:items-center md:text-center gap-3"
                >
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full lp-card border-[var(--lp-border-strong)] z-10">
                    <Icon className="w-6 h-6 text-[var(--lp-gold-light)]" />
                  </div>
                  <span className="lp-eyebrow">Step {step.code}</span>
                  <h3 className="text-lg font-semibold lp-font-display text-[var(--lp-ink)]">{step.title}</h3>
                  <p className="text-xs text-[var(--lp-ink-dim)] leading-relaxed max-w-[220px]">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
