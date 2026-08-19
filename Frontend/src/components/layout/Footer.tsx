import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] font-serif">LegalAI</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Supreme Court inspired legal architecture integrated with next-generation artificial legal intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Decoupled API Architecture</span>
            </div>
          </div>

          {/* Citizen Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-sans">
              Citizen Portal
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/citizen/case-intelligence" className="hover:text-blue-400 transition-colors">
                  AI Problem Solver
                </Link>
              </li>
              <li>
                <Link href="/citizen/legal-research" className="hover:text-blue-400 transition-colors">
                  Legal RAG Research
                </Link>
              </li>
              <li>
                <Link href="/citizen/documents" className="hover:text-blue-400 transition-colors">
                  Document OCR & Risk Check
                </Link>
              </li>
              <li>
                <Link href="/citizen/lawyers" className="hover:text-blue-400 transition-colors">
                  Find Verified Lawyers
                </Link>
              </li>
            </ul>
          </div>

          {/* Lawyer Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-sans">
              Lawyer Workspace
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/lawyer/dashboard" className="hover:text-purple-400 transition-colors">
                  Active Case Insights
                </Link>
              </li>
              <li>
                <Link href="/lawyer/precedents" className="hover:text-purple-400 transition-colors">
                  Precedent & Judgment Search
                </Link>
              </li>
              <li>
                <Link href="/lawyer/hearings" className="hover:text-purple-400 transition-colors">
                  Hearing Preparation Suite
                </Link>
              </li>
              <li>
                <Link href="/lawyer/documents" className="hover:text-purple-400 transition-colors">
                  Brief & Contract Analyzer
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-sans">
              Architecture & Team
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">
                  Role-Aware Auth
                </Link>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">NEXT_PUBLIC_USE_MOCKS Supported</span>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Tailwind CSS + Framer Motion</span>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">TypeScript API Schemas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Legal Advisory Banner */}
        <LegalDisclaimer variant="banner" />

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} LegalAI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
