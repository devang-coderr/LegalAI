"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, Menu, X, ArrowRight, User, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 py-4 ${
        scrolled
          ? "bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
            <div className="absolute -inset-0.5 rounded-xl bg-blue-500/30 blur-sm -z-10 group-hover:blur-md transition-all" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-serif flex items-center gap-1.5">
              LegalAI
              <span className="text-[10px] uppercase font-sans tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0
              </span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-sans">
              Supreme Court × Judicial AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border border-[var(--border-color)]">
          <Link
            href="/#features"
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-secondary)]"
          >
            Features
          </Link>
          <Link
            href="/citizen"
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-secondary)] flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            Citizen Mode
          </Link>
          <Link
            href="/lawyer"
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-secondary)] flex items-center gap-1"
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            Lawyer Workspace
          </Link>
          <Link
            href="/#research"
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-secondary)]"
          >
            Legal RAG
          </Link>
        </nav>

        {/* Actions & Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/citizen/case-intelligence">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Analyze Case
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 p-6 rounded-2xl glass-panel bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col gap-4"
          >
            <Link
              href="/citizen"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 text-blue-400 font-medium text-sm"
            >
              <User className="w-4 h-4" />
              Citizen Mode
            </Link>
            <Link
              href="/lawyer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 text-purple-400 font-medium text-sm"
            >
              <Briefcase className="w-4 h-4" />
              Lawyer Workspace
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Sign In
            </Link>
            <Link href="/citizen/case-intelligence" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Explore Legal AI Solver
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
