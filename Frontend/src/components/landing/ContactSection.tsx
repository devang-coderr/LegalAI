"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Terminal, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="landing-root relative py-24 sm:py-32 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <span className="lp-eyebrow">Contact</span>
          <h2 className="text-3xl sm:text-5xl font-semibold lp-font-display text-[var(--lp-ink)] leading-tight">
            Let&apos;s build the future of legal intelligence.
          </h2>
          <p className="text-sm text-[var(--lp-ink-dim)] max-w-sm">
            Questions, partnerships, or feedback on LegalAI — we&apos;d like to hear it.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <a href="mailto:hello@legalai.app" className="flex items-center gap-3 text-sm text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors">
              <Mail className="w-4 h-4" /> hello@legalai.app
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors">
              <Terminal className="w-4 h-4" /> github.com/legalai
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[var(--lp-ink-dim)] hover:text-[var(--lp-gold-light)] transition-colors">
              <Briefcase className="w-4 h-4" /> linkedin.com/company/legalai
            </a>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="lp-card rounded-2xl p-6 sm:p-8 space-y-4"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
              <CheckCircle2 className="w-8 h-8 text-[var(--lp-gold-light)]" />
              <p className="text-sm text-[var(--lp-ink)] font-medium">Message received.</p>
              <p className="text-xs text-[var(--lp-ink-faint)]">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--lp-ink-faint)]">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-lg bg-transparent border border-[var(--lp-border)] px-3 py-2.5 text-sm text-[var(--lp-ink)] focus:outline-none focus:border-[var(--lp-border-strong)] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--lp-ink-faint)]">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full rounded-lg bg-transparent border border-[var(--lp-border)] px-3 py-2.5 text-sm text-[var(--lp-ink)] focus:outline-none focus:border-[var(--lp-border-strong)] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[var(--lp-ink-faint)]">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 w-full rounded-lg bg-transparent border border-[var(--lp-border)] px-3 py-2.5 text-sm text-[var(--lp-ink)] focus:outline-none focus:border-[var(--lp-border-strong)] transition-colors resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-3 rounded-full bg-[var(--lp-gold)] text-[#0b0b0a] hover:bg-[var(--lp-gold-light)] transition-colors"
              >
                Send Message <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
