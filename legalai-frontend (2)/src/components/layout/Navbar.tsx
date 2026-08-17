"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Product", href: "/#network" },
  { label: "Case Intelligence", href: "/#capabilities" },
  { label: "For Citizens", href: "/#modes" },
  { label: "For Lawyers", href: "/#modes" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500",
          scrolled
            ? "border-[var(--surface-border)] bg-[var(--surface)]/70 shadow-[var(--shadow-elevated)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--azure-soft)] text-[var(--azure)]">
            <Scale className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
            LegalAI
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--ink-muted)] transition-colors duration-300 hover:text-[var(--ink)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex px-4 py-2 text-xs">
            Log in
          </Button>
          <Button href="/register" className="px-4 py-2 text-xs" showArrow>
            Get Started
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
