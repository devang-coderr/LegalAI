"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { CitationCard } from "@/components/legal/CitationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { MOCK_PRECEDENTS } from "@/mocks/legalResearch";

export default function LawyerPrecedentsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_PRECEDENTS.filter(
      (p) =>
        p.caseName.toLowerCase().includes(q) ||
        p.court.toLowerCase().includes(q) ||
        p.legalIssue.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Precedents & Citations" description="Search previous judgments by case, court, or legal issue." />

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-2)]/70 px-4 py-3">
        <Search className="h-4 w-4 text-[var(--ink-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by case, court, or legal issue…"
          className="flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matching precedents" description="Try a different search term." />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <CitationCard key={p.id} precedent={p} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
