"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#insights", label: "Insights" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#contact", label: "Contact" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-8 ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-500 ${
          scrolled
            ? "px-4 sm:px-5 py-2 lp-card border shadow-[0_10px_40px_-14px_rgba(0,0,0,0.5)]"
            : "px-1 py-1 border border-transparent"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[var(--lp-border-strong)] text-[var(--lp-gold-light)]">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.08em] text-[var(--lp-ink)] lp-font-display">
              LEGALAI
            </span>
            <span className="text-[9px] text-[var(--lp-ink-faint)] tracking-[0.18em] uppercase mt-0.5">
              Supreme Court × Judicial AI
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 mx-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-wide text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle className="!border-[var(--lp-border)] !bg-transparent hover:!border-[var(--lp-border-strong)]" />
          <Link
            href="/login"
            className="text-xs font-medium text-[var(--lp-ink-dim)] hover:text-[var(--lp-ink)] transition-colors px-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[var(--lp-gold)] text-[#0b0b0a] hover:bg-[var(--lp-gold-light)] transition-colors"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle className="!border-[var(--lp-border)] !bg-transparent" />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 rounded-full border border-[var(--lp-border)] text-[var(--lp-ink)]"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-3 mx-1 lp-card rounded-3xl overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors border-b border-[var(--lp-border)] last:border-b-0"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-xs font-medium py-2.5 rounded-full border border-[var(--lp-border)] text-[var(--lp-ink)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-xs font-semibold py-2.5 rounded-full bg-[var(--lp-gold)] text-[#0b0b0a]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
