import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--surface-border)] bg-[var(--void)] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--azure-soft)] text-[var(--azure)]">
            <Scale className="h-3.5 w-3.5" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">
            LegalAI
          </span>
        </div>
        <p className="text-xs text-[var(--ink-faint)]">
          Demo interface. Legal outputs shown are sample data, not legal advice.
        </p>
        <div className="flex gap-5 text-xs text-[var(--ink-muted)]">
          <Link href="/privacy" className="transition-colors hover:text-[var(--ink)]">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-[var(--ink)]">Terms</Link>
          <Link href="/contact" className="transition-colors hover:text-[var(--ink)]">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
