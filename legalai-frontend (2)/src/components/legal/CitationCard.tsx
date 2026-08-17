"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Precedent } from "@/types/lawyer";

export function CitationCard({ precedent }: { precedent: Precedent }) {
  const [open, setOpen] = useState(false);

  return (
    <Card glow={false}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">
            {precedent.caseName}
          </h3>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-faint)]">
            {precedent.court} · {precedent.year} · {precedent.citation}
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-[var(--ink-faint)] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--azure)]">
            {precedent.legalIssue}
          </p>
          <p className="mt-1.5 text-sm text-[var(--ink-muted)]">{precedent.excerpt}</p>
        </div>
      </div>
    </Card>
  );
}
