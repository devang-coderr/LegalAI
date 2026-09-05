"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  FileText,
  BookOpen,
  Scale,
  ArrowRight,
  History,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";
import { useCases } from "@/hooks/useCases";
import { currentUserId, appendToBucket, readBucket } from "@/lib/workspace-store";
import { CITIZEN_BUCKETS, type RecentAnalysis, type RecentSearch } from "@/types/citizen";

function CaseIntelligenceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const { isLoading, error, intelligenceResult, solveCase } = useCases();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note in citizen/page.tsx
    setRecentSearches(readBucket<RecentSearch>(CITIZEN_BUCKETS.searches, currentUserId()));
  }, []);

  const runAnalysis = async (textQuery: string) => {
    if (!textQuery.trim()) return;
    const userId = currentUserId();
    setRecentSearches(appendToBucket<RecentSearch>(CITIZEN_BUCKETS.searches, userId, {
      id: `search-${Date.now()}`,
      query: textQuery,
      createdAt: new Date().toISOString(),
    }, 10));

    const result = await solveCase(textQuery);
    if (result) {
      appendToBucket<RecentAnalysis>(CITIZEN_BUCKETS.analyses, userId, {
        id: `analysis-${Date.now()}`,
        query: textQuery,
        summary: result.summary,
        createdAt: new Date().toISOString(),
      }, 10);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(query);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Case Intelligence
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Describe any legal scenario in normal language. LegalAI parses statutory laws, section provisions, and relevant precedents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_.36fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Input Box */}
          <Card variant="glass" className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Describe Your Legal Issue
                </label>
                <textarea
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. My landlord is refusing to refund my security deposit of Rs. 75,000 after I vacated the apartment with 30 days written notice as per agreement..."
                  className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  Press &quot;Analyze Case&quot; to run the AI reasoning pipeline
                </span>
                <Button type="submit" variant="primary" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Analyze Case
                </Button>
              </div>
            </form>
          </Card>

          {/* Processing State */}
          {isLoading && (
            <Card variant="glass" className="p-8 space-y-4 border-[var(--accent-gold)]/40 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)] animate-spin">
                  <Loader2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
                Analyzing your case…
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Parsing facts, matching statutory provisions, and retrieving relevant precedents.
              </p>
            </Card>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <Card variant="glass" className="p-6 border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-300">Unable to analyze this case</h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => runAnalysis(query)}>Retry</Button>
              </div>
            </Card>
          )}

          {/* Structured Case Output */}
          {!isLoading && intelligenceResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <LegalDisclaimer variant="banner" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="glass" className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm font-serif">
                    <FileText className="w-4 h-4" />
                    <span>1. Extracted Case Facts</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    <li><span className="font-semibold text-[var(--text-primary)]">Overview:</span> {intelligenceResult.facts.overview}</li>
                    <li><span className="font-semibold text-[var(--text-primary)]">Parties:</span> {intelligenceResult.facts.parties.plaintiff} vs. {intelligenceResult.facts.parties.defendant}</li>
                    {intelligenceResult.facts.keyEvents.map((ev, i) => (
                      <li key={i}><span className="font-semibold text-[var(--text-primary)]">{ev.date}:</span> {ev.event}</li>
                    ))}
                  </ul>
                </Card>

                <Card variant="glass" className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-serif">
                    <BookOpen className="w-4 h-4" />
                    <span>2. Applicable Statutory Laws & Sections</span>
                  </div>
                  <div className="space-y-3">
                    {intelligenceResult.applicableLaws.map((law, i) => (
                      <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <span className="font-bold text-amber-300 font-serif">{law.section} {law.actName}</span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1">{law.explanation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {intelligenceResult.precedents.length > 0 && (
                <Card variant="glass" className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-serif">
                    <Scale className="w-4 h-4" />
                    <span>3. Relevant Precedents</span>
                  </div>
                  {intelligenceResult.precedents.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif">{p.caseName}</h4>
                        <span className="text-xs text-[var(--text-muted)]">{p.citation}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.whyRelevant}</p>
                    </div>
                  ))}
                </Card>
              )}

              {intelligenceResult.recommendedSteps.length > 0 && (
                <Card variant="parchment" className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    <span>4. Recommended Next Steps</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--text-secondary)]">
                    {intelligenceResult.recommendedSteps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </Card>
              )}
            </motion.div>
          )}
        </div>

        {/* Recent Searches */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold font-serif text-[var(--text-primary)] flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--text-muted)]" /> Recent Searches
          </h3>
          {recentSearches.length === 0 ? (
            <EmptyState
              title="No recent searches"
              description="Your past questions will show up here so you can revisit them."
              className="p-6"
            />
          ) : (
            <div className="space-y-2">
              {recentSearches.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setQuery(s.query); runAnalysis(s.query); }}
                  className="w-full text-left p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)]/40 transition-colors"
                >
                  <p className="text-xs text-[var(--text-primary)] line-clamp-2">{s.query}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CaseIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--accent-gold)]">Loading Case Intelligence...</div>}>
      <CaseIntelligenceContent />
    </Suspense>
  );
}
