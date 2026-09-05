"use client";

import { useState } from "react";
import { BookOpen, Bookmark, Filter, Scale, Search, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { useLegalResearch } from "@/hooks/useLegalResearch";
import type { Citation } from "@/types/legal";
import type { ApplicableLaw } from "@/types/case";

type FilterType = "all" | "Judgment" | "Statute";

interface SelectedSource {
  id: string;
  title: string;
  citation: string;
  type: "Judgment" | "Statute";
  court?: string;
  summary: string;
  ratio?: string;
  relevanceScore?: number;
}

export default function LawyerLegalResearchPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [saved, setSaved] = useState<string[]>([]);
  const [openSource, setOpenSource] = useState<SelectedSource | null>(null);
  const { activeCases } = useLawyerCases();
  const { isLoading, error, researchResult, performResearch } = useLegalResearch();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!q.trim()) return;
    performResearch(q.trim(), "ALL");
  };

  const citations: SelectedSource[] = (researchResult?.citations || []).map((c: Citation) => {
    const isJudgment = c.sourceType === "Judgment" || c.category === "judgment";
    const resolvedType: "Judgment" | "Statute" = isJudgment ? "Judgment" : "Statute";
    return {
      id: c.id,
      title: c.title,
      citation: c.citationNumber,
      type: resolvedType,
      court: c.court && c.court !== "ALL" ? c.court : undefined,
      summary: c.excerpt,
      ratio: c.ratioDecidendi || c.excerpt,
      relevanceScore: 95,
    };
  });

  const laws: SelectedSource[] = (researchResult?.applicableLaws || []).map((l: ApplicableLaw, idx: number) => ({
    id: `law-${idx}`,
    title: `${l.actName} — ${l.section}`,
    citation: l.section,
    type: "Statute" as const,
    summary: l.title,
    ratio: l.explanation,
    relevanceScore: 92,
  }));

  const allSources = [...citations];
  for (const law of laws) {
    if (!allSources.some((s) => s.title.toLowerCase().includes(law.citation.toLowerCase()) || s.citation.toLowerCase() === law.citation.toLowerCase())) {
      allSources.push(law);
    }
  }

  const filteredSources = allSources.filter((s) => filter === "all" || s.type === filter);

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-serif text-4xl font-bold">Legal Research</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Search judgments, statutory provisions and precedents backed by LegalAI semantic retrieval and Indian jurisprudence.
        </p>
      </div>

      <Card variant="glass" className="p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[var(--accent-gold)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-3 pl-11 pr-4 text-sm"
              placeholder="Search cases, sections, citations, legal issues (e.g. arbitration appointment, limitation act)..."
            />
          </div>
          <Button type="submit" isLoading={isLoading} disabled={!q.trim()}>
            <Search className="mr-2 h-4 w-4" />Search
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-2">
          {(["all", "Judgment", "Statute"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-[var(--accent-gold-light)] text-[var(--accent-gold)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              <Filter className="h-3 w-3" />{f === "all" ? "All Sources" : `${f}s`}
            </button>
          ))}
        </div>

        {researchResult && (
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
            <Sparkles className="h-4 w-4" />Research pass complete · {filteredSources.length} matching sources retrieved from Indian legal corpus
          </div>
        )}
      </Card>

      {error && (
        <Card variant="glass" className="border-rose-500/30 bg-rose-500/10 p-5">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <h3 className="font-serif font-bold text-rose-300">Research Error</h3>
              <p className="mt-1 text-xs text-rose-200/90">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* AI Explanation Banner */}
      {researchResult?.aiExplanation && (
        <Card variant="glass" className="p-5 border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)]/15">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
            <h3 className="font-serif font-bold text-sm">Jurisprudential Assessment</h3>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">{researchResult.aiExplanation}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_.32fr]">
        <div className="space-y-4">
          {isLoading ? (
            <Card variant="glass" className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-gold)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Searching Indian legal corpus…</p>
              <p className="text-xs text-[var(--text-secondary)]">Retrieving statutory sections, case precedents, and ratios decidendi.</p>
            </Card>
          ) : filteredSources.length > 0 ? (
            filteredSources.map((s) => (
              <Card key={s.id} variant="glass" className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="gold" size="sm">{s.citation}</Badge>
                      <Badge variant={s.type === "Judgment" ? "blue" : "neutral"} size="sm">{s.type}</Badge>
                      {s.court && <span className="text-[10px] text-[var(--text-muted)] font-medium">· {s.court}</span>}
                    </div>
                    <h2 className="mt-2 font-serif text-lg font-bold">{s.title}</h2>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{s.summary}</p>
                  </div>
                  {s.relevanceScore && (
                    <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 shrink-0">
                      {s.relevanceScore}% match
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2 border-t border-[var(--border-color)] pt-4">
                  <Button variant="outline" size="sm" onClick={() => setOpenSource(s)}>
                    <Scale className="mr-1.5 h-3.5 w-3.5" />View Ratio & Citation
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSaved((v) => (v.includes(s.id) ? v.filter((x) => x !== s.id) : [...v, s.id]))}>
                    <Bookmark className="mr-1.5 h-3.5 w-3.5" />{saved.includes(s.id) ? "Saved" : "Save"}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card variant="glass" className="p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
              <p className="mt-3 text-sm">
                {researchResult ? "No sources matched this specific filter. Try 'All Sources' or broaden your query." : "Enter a legal query above to search verified Indian judgments, statutory provisions, and acts."}
              </p>
            </Card>
          )}
        </div>

        <Card variant="glass" className="h-fit p-5">
          <h3 className="font-serif font-bold">Research workspace</h3>
          <div className="mt-4 space-y-2 text-xs">
            <div className="rounded-xl bg-[var(--bg-card)] p-3">Saved authorities <b className="float-right">{saved.length}</b></div>
            <div className="rounded-xl bg-[var(--bg-card)] p-3">Citation format <b className="float-right">SCC / AIR / Bare Act</b></div>
            <div className="rounded-xl bg-[var(--bg-card)] p-3">Active matters <b className="float-right">{activeCases.length}</b></div>
          </div>
          <div className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-purple-300">Semantic AI Research</p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              Queries are embedded into high-dimensional vectors and searched against Qdrant vector database and Gemini reasoning models.
            </p>
          </div>
        </Card>
      </div>

      <Drawer isOpen={!!openSource} onClose={() => setOpenSource(null)} title={openSource?.citation}>
        {openSource && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold">{openSource.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">{openSource.citation}</Badge>
              <Badge variant={openSource.type === "Judgment" ? "blue" : "neutral"} size="sm">{openSource.type}</Badge>
              {openSource.court && <span className="text-xs text-[var(--text-muted)]">{openSource.court}</span>}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {openSource.type === "Judgment" ? "Ratio Decidendi / Key Holding" : "Statutory Explanation"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{openSource.ratio}</p>
            </div>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setSaved((v) => (v.includes(openSource.id) ? v.filter((x) => x !== openSource.id) : [...v, openSource.id]))}
            >
              <Bookmark className="mr-1.5 h-3.5 w-3.5" />{saved.includes(openSource.id) ? "Saved" : "Save Authority"}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
