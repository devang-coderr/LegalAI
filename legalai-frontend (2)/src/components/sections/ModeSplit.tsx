"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Gavel, Users } from "lucide-react";

const MODES = [
  {
    icon: Users,
    title: "For Citizens",
    desc: "Describe your problem in your own words. Understand your legal position, the documents you need, and what to do next.",
    cta: "Continue as Citizen",
    href: "/login?role=citizen",
  },
  {
    icon: Gavel,
    title: "For Lawyers",
    desc: "A research workspace built for speed — case intelligence, precedent search, and hearing preparation in one place.",
    cta: "Continue as Lawyer",
    href: "/login?role=lawyer",
  },
];

const MotionLink = motion.create(Link);

export function ModeSplit() {
  return (
    <section id="modes" className="relative bg-[var(--void)] px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[var(--azure)]">
          Two workspaces, one intelligence
        </p>
        <h2 className="mt-4 text-balance font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
          Built for how each of you actually works
        </h2>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
        {MODES.map((mode, i) => (
          <MotionLink
            href={mode.href}
            key={mode.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-2)]/60 p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--azure-soft)] blur-3xl transition-transform duration-700 group-hover:scale-150"
            />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--azure-soft)] text-[var(--azure)]">
              <mode.icon className="h-5 w-5" />
            </div>
            <h3 className="relative mt-6 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {mode.title}
            </h3>
            <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
              {mode.desc}
            </p>
            <div className="relative mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink)]">
              {mode.cta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </MotionLink>
        ))}
      </div>
    </section>
  );
}
