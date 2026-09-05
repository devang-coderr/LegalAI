"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Search, ScanText, ShieldAlert, CheckCircle2, Star } from "lucide-react";
import { StarField } from "@/components/landing/StarField";

function PhoneFrame({
  children,
  delay,
  offsetY = 0,
  rotate = 0,
  inView,
}: {
  children: React.ReactNode;
  delay: number;
  offsetY?: number;
  rotate?: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: rotate * 2.2, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: offsetY, rotate, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: offsetY - 8, rotate: rotate * 0.4 }}
      className="lp-phone shrink-0"
    >
      <div className="lp-phone-notch" />
      <div className="lp-phone-screen">{children}</div>
    </motion.div>
  );
}

function CitizenScreen() {
  return (
    <div className="h-full w-full flex flex-col p-3 text-[9px]">
      <div className="flex items-center gap-1.5 pt-4 pb-3">
        <Sparkles className="w-3 h-3 text-[var(--lp-gold-light)]" />
        <span className="font-semibold text-[var(--lp-ink)]">Ask LegalAI</span>
      </div>
      <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm bg-[var(--lp-gold)]/90 text-[#0b0b0a] px-2.5 py-2 mb-2 leading-snug">
        My landlord has not returned my deposit.
      </div>
      <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-white/[0.06] border border-white/10 px-2.5 py-2 space-y-1.5 leading-snug text-[var(--lp-ink-dim)]">
        <p className="text-[var(--lp-ink)] font-medium">Relevant law identified</p>
        <p>Applicable under state Rent Control provisions.</p>
        <div className="flex items-center gap-1 pt-1 text-[var(--lp-gold-light)]">
          <CheckCircle2 className="w-2.5 h-2.5" /> 3 required documents
        </div>
        <div className="flex items-center gap-1 text-[var(--lp-gold-light)]">
          <CheckCircle2 className="w-2.5 h-2.5" /> Suggested next steps
        </div>
      </div>
    </div>
  );
}

function ResearchScreen() {
  return (
    <div className="h-full w-full flex flex-col p-3 text-[9px]">
      <div className="flex items-center gap-1.5 pt-4 pb-3">
        <Search className="w-3 h-3 text-[var(--lp-gold-light)]" />
        <span className="font-semibold text-[var(--lp-ink)]">Search Judgment</span>
      </div>
      <div className="rounded-lg bg-white/[0.06] border border-white/10 px-2 py-1.5 mb-3 text-[var(--lp-ink-faint)]">
        tenant deposit dispute…
      </div>
      {[
        { court: "Supreme Court", year: "2019", score: "96%" },
        { court: "Delhi HC", year: "2021", score: "91%" },
        { court: "Bombay HC", year: "2017", score: "87%" },
      ].map((c) => (
        <div key={c.court} className="rounded-lg border border-white/10 px-2.5 py-2 mb-1.5">
          <div className="flex items-center justify-between text-[var(--lp-ink)] font-medium">
            <span>{c.court}</span>
            <span className="flex items-center gap-0.5 text-[var(--lp-gold-light)]">
              <Star className="w-2.5 h-2.5" /> {c.score}
            </span>
          </div>
          <p className="text-[var(--lp-ink-faint)] mt-0.5">Judgment · {c.year}</p>
        </div>
      ))}
    </div>
  );
}

function DocumentScreen() {
  return (
    <div className="h-full w-full flex flex-col p-3 text-[9px]">
      <div className="flex items-center gap-1.5 pt-4 pb-3">
        <ScanText className="w-3 h-3 text-[var(--lp-gold-light)]" />
        <span className="font-semibold text-[var(--lp-ink)]">Upload Document</span>
      </div>
      <div className="rounded-lg border border-dashed border-white/15 px-2.5 py-3 text-center text-[var(--lp-ink-faint)] mb-3">
        rental_agreement.pdf
        <div className="mt-1 text-[var(--lp-gold-light)] font-medium">OCR complete</div>
      </div>
      <div className="rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-2 mb-1.5 leading-snug">
        <p className="text-[var(--lp-ink)] font-medium">Important clauses</p>
        <p className="text-[var(--lp-ink-faint)]">Clause 7 — Security deposit return window</p>
      </div>
      <div className="rounded-lg bg-rose-500/10 border border-rose-500/25 px-2.5 py-2 flex items-start gap-1.5 leading-snug">
        <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
        <span className="text-rose-300">Risk detected — no return timeline specified</span>
      </div>
    </div>
  );
}

export function PhoneShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section className="landing-root relative py-28 sm:py-36 px-4 sm:px-8 overflow-hidden">
      <StarField density={80} goldRatio={0.15} />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16 sm:mb-24">
          <span className="lp-eyebrow">Inside The Product</span>
          <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)]">
            What LegalAI feels like.
          </h2>
          <p className="text-sm text-[var(--lp-ink-dim)]">
            A glimpse of the experience waiting on the other side of sign-in.
          </p>
        </div>

        <div
          ref={ref}
          className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-6 lg:gap-10"
        >
          <PhoneFrame delay={0} offsetY={28} rotate={-6} inView={inView}>
            <CitizenScreen />
          </PhoneFrame>
          <PhoneFrame delay={0.18} offsetY={-14} rotate={0} inView={inView}>
            <ResearchScreen />
          </PhoneFrame>
          <PhoneFrame delay={0.34} offsetY={28} rotate={6} inView={inView}>
            <DocumentScreen />
          </PhoneFrame>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 mt-16 text-[10px] uppercase tracking-widest text-[var(--lp-ink-faint)]">
          <span>Citizen Mode</span>
          <span>Legal Research</span>
          <span>Document Intelligence</span>
        </div>
      </div>
    </section>
  );
}
