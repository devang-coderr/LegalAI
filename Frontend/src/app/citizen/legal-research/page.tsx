"use client";

import React, { useState } from "react";
import {
  Search,
  Scale,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";
import { Citation } from "@/types/legal";

export default function LegalResearchPage() {
  const [query, setQuery] = useState("What are the grounds for setting aside an ex-parte decree under Order 9 Rule 13 CPC?");
  const [courtFilter, setCourtFilter] = useState("ALL");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const mockCitations: Citation[] = [
    {
      id: "cit-1",
      title: "G.P. Srivastava vs. R.K. Raizada & Ors.",
      citationNumber: "(2000) 3 SCC 54",
      court: "Supreme Court of India",
      judgmentDate: "2000-03-02",
      excerpt: "Sufficiency of cause for non-appearance under Order 9 Rule 13 CPC must be considered liberally. The court should not adopt a hyper-technical approach when genuine illness or delay in communication is established.",
      ratioDecidendi: "Sufficient cause under Order 9 Rule 13 must relate to the date of hearing. Previous defaults cannot be used to penalize defendant if reasonable cause is established for the specific hearing date.",
    },
    {
      id: "cit-2",
      title: "Parimal vs. Veena @ Bharti",
      citationNumber: "(2011) 3 SCC 545",
      court: "Supreme Court of India",
      judgmentDate: "2011-02-10",
      excerpt: "Where service of summons was duly effected, mere technical irregularity in service cannot be a ground to set aside an ex-parte decree unless prejudice is demonstrated.",
      ratioDecidendi: "Standard of proof for setting aside decree requires establishing that summons was not duly served or defendant was prevented by sufficient cause.",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="violet">Retrieval-Augmented Generation</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Legal RAG Research Engine
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Query 500,000+ Supreme Court & High Court judgments. Answers clearly separate AI reasoning syntheses from verified judicial citations.
        </p>
      </div>

      {/* Search Input & Filter Bar */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a legal research query or section provision..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            />
          </div>
          <Button variant="primary" className="w-full sm:w-auto text-xs py-3">
            Search Precedents
          </Button>
        </div>

        {/* Court Level Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--text-muted)] flex items-center gap-1 shrink-0 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Court Level:
          </span>
          {["ALL", "Supreme Court of India", "Delhi High Court", "Bombay High Court"].map((c) => (
            <button
              key={c}
              onClick={() => setCourtFilter(c)}
              className={`px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
                courtFilter === c
                  ? "bg-purple-600 text-white border-purple-500 font-semibold"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* AI Reasoning Synthesis vs Official Sources */}
      <div className="space-y-6">
        {/* Box A: AI-Generated Synthesized Explanation */}
        <Card variant="glass" className="p-6 space-y-3 border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-serif uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Synthesized Explanation</span>
            </div>
            <Badge variant="violet">RAG Summary</Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Under Order 9 Rule 13 of the Code of Civil Procedure (CPC), 1908, an ex-parte decree passed against a defendant may be set aside if the applicant satisfies the court of either of two primary grounds: (1) that the summons was not duly served, or (2) that the defendant was prevented by any <em>&quot;sufficient cause&quot;</em> from appearing when the suit was called on for hearing.
          </p>
        </Card>

        {/* Box B: Retrieved Verified Legal Citations & Sources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[var(--text-primary)] flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Retrieved Ratio Decidendi & Judicial Citations ({mockCitations.length})</span>
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">Verified from Judgments DB</span>
          </div>

          <div className="space-y-3">
            {mockCitations.map((cit) => (
              <Card key={cit.id} variant="glass" className="p-5 space-y-3 hover:border-emerald-500/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="gold" size="sm">
                      {cit.citationNumber}
                    </Badge>
                    <h4 className="text-base font-bold text-[var(--text-primary)] font-serif mt-1">
                      {cit.title}
                    </h4>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {cit.court} • {cit.judgmentDate}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCitation(cit)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    View Source Excerpt
                  </Button>
                </div>

                <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
                  &quot;{cit.excerpt}&quot;
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Mandatory Advisory Notice */}
        <LegalDisclaimer variant="compact" />
      </div>

      {/* Citation Drawer Panel */}
      <Drawer
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        title={selectedCitation?.title || "Judgment Citation"}
      >
        {selectedCitation && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="gold">{selectedCitation.citationNumber}</Badge>
              <p className="text-xs text-blue-400">{selectedCitation.court} ({selectedCitation.judgmentDate})</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Ratio Decidendi Summary
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                {selectedCitation.ratioDecidendi}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Full Verbatim Excerpt
              </h4>
              <p className="text-xs text-[var(--text-primary)] font-serif leading-relaxed italic p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                &quot;{selectedCitation.excerpt}&quot;
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-color)] flex gap-3">
              <Button variant="primary" size="sm" className="w-full" leftIcon={<Bookmark className="w-3.5 h-3.5" />}>
                Save Citation
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
