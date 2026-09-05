"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StarField } from "@/components/landing/StarField";

export function FinalCTA() {
  return (
    <section className="landing-root relative py-32 sm:py-44 px-4 sm:px-8 overflow-hidden text-center">
      <StarField density={60} goldRatio={0.18} />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, var(--lp-gold-glow), transparent 55%)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7 }}
        className="relative max-w-3xl mx-auto space-y-8"
      >
        <h2 className="text-4xl sm:text-6xl font-semibold lp-font-display text-[var(--lp-ink)] leading-[1.1]">
          The law is complex.
          <br />
          <span className="lp-gold-text">Understanding it shouldn&apos;t be.</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--lp-ink-dim)] max-w-lg mx-auto">
          Explore a new way to interact with legal intelligence.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full bg-[var(--lp-gold)] text-[#0b0b0a] hover:bg-[var(--lp-gold-light)] transition-colors"
          >
            Explore LegalAI <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3.5 rounded-full border border-[var(--lp-border-strong)] text-[var(--lp-ink)] hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
