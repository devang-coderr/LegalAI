"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Terminal, Briefcase, Mail } from "lucide-react";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "About", href: "#about" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Insights", href: "#insights" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Legal Intelligence", href: "#story" },
      { label: "Research", href: "#story" },
      { label: "Document Intelligence", href: "#story" },
      { label: "Case Assistance", href: "/register" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Insights", href: "#insights" },
      { label: "FAQ", href: "#contact" },
      { label: "Documentation", href: "/register" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="landing-root relative overflow-hidden border-t border-[var(--lp-border)]">
      {/* Subtle document-grid texture behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--lp-ink) 0 1px, transparent 1px 46px), repeating-linear-gradient(90deg, var(--lp-ink) 0 1px, transparent 1px 46px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 0%, var(--lp-gold-glow), transparent 55%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-28 sm:pt-40 pb-16">
        {/* Brand row */}
        <div className="flex flex-col items-start gap-5 mb-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lp-border-strong)] text-[var(--lp-gold-light)]">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold tracking-[0.08em] lp-font-display text-[var(--lp-ink)]">
              LEGALAI
            </span>
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--lp-ink-faint)]">
            Supreme Court × Judicial AI
          </p>
          <p className="text-sm text-[var(--lp-ink-dim)] leading-relaxed max-w-sm">
            AI-powered legal intelligence for understanding law, cases and documents.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lp-border)] text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] hover:border-[var(--lp-border-strong)] transition-colors">
              <Terminal className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lp-border)] text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] hover:border-[var(--lp-border-strong)] transition-colors">
              <Briefcase className="w-4 h-4" />
            </a>
            <a href="mailto:hello@legalai.app" aria-label="Email" className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lp-border)] text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] hover:border-[var(--lp-border-strong)] transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10 pb-16 border-b border-[var(--lp-border)]">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--lp-ink-faint)]">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-xs text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer — its own quiet block */}
        <div className="max-w-2xl mx-auto text-center py-10">
          <p className="text-[11px] leading-relaxed text-[var(--lp-ink-faint)]">
            LegalAI provides AI-assisted legal information and research support. It does not
            constitute formal legal advice or advocate representation.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--lp-ink-faint)] pt-8">
          <p>LegalAI © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[var(--lp-ink-dim)] transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-[var(--lp-ink-dim)] transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-[var(--lp-ink-dim)] transition-colors cursor-pointer">Disclaimer</span>
          </div>
        </div>
      </div>

      {/* Final-scene watermark — reveals gently, never overlaps content above */}
      <div className="relative h-[16vw] sm:h-[13vw] max-h-64 min-h-[110px] overflow-hidden flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.05, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          aria-hidden="true"
          className="select-none font-semibold lp-font-display leading-none tracking-tight whitespace-nowrap"
          style={{ fontSize: "clamp(4.5rem, 17vw, 13rem)", color: "var(--lp-ink)" }}
        >
          LEGALAI
        </motion.div>
      </div>
    </footer>
  );
}
