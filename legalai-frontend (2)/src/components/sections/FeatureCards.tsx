"use client";

import { motion } from "framer-motion";
import { FileSearch, Scale, ScanSearch, GitCompareArrows } from "lucide-react";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: Scale,
    title: "Case Intelligence",
    desc: "Describe what happened. LegalAI structures the facts, identifies the legal issues, and maps them to governing law.",
  },
  {
    icon: FileSearch,
    title: "Legal Research",
    desc: "Ask a question in plain language and get an answer grounded in real sources — every citation is traceable.",
  },
  {
    icon: ScanSearch,
    title: "Document Intelligence",
    desc: "Upload a notice, agreement, or judgment. LegalAI surfaces key clauses, dates, and terms worth your attention.",
  },
  {
    icon: GitCompareArrows,
    title: "Similar Cases",
    desc: "See how comparable disputes were resolved, with the shared facts and reasoning laid out clearly.",
  },
];

export function FeatureCards() {
  return (
    <section id="capabilities" className="relative bg-[var(--surface)]/40 px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--azure)]">
          Capabilities
        </p>
        <h2 className="mt-4 text-balance font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
          Four ways into the same understanding
        </h2>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="h-full">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--azure-soft)] text-[var(--azure)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{f.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
