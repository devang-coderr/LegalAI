"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, FileText, Gavel, ListChecks, Loader2, PenSquare, Scale, Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { statusToBadgeVariant } from "@/lib/case-status";
import { analyzeCaseIntelligence } from "@/services/case.api";
import type { CaseIntelligenceResult } from "@/types/case";

type Mode = "existing" | "manual";

function LawyerCaseIntelligenceContent() {
  const searchParams = useSearchParams();
  const prefillCaseId = searchParams.get("caseId");
  const { cases, isLoading } = useLawyerCases();

  const [mode, setMode] = useState<Mode>("existing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualFacts, setManualFacts] = useState("");
  const [question, setQuestion] = useState("");
  const [analysisState, setAnalysisState] = useState<"idle" | "running" | "unavailable">("idle");
  const [result, setResult] = useState<CaseIntelligenceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prefillCaseId) {
      setSelectedId(prefillCaseId);
      setMode("existing");
    }
  }, [prefillCaseId]);

  const selected = cases.find((c) => c.id === selectedId) ?? null;
  const canRun = mode === "existing" ? !!selected && question.trim().length > 0 : manualFacts.trim().length > 0 && question.trim().length > 0;

  const runAnalysis = async () => {
    if (!canRun) return;
    setAnalysisState("running");
    setErrorMessage(null);

    const queryText = mode === "existing" && selected
      ? `${selected.title}. ${selected.description || ""}\nSpecific Question: ${question}`
      : `${manualFacts}\nSpecific Question: ${question}`;

    const res = await analyzeCaseIntelligence(
      queryText,
      mode === "existing" && selected ? selected.id : undefined
    );

    if (res.success && res.data) {
      setResult(res.data);
      setAnalysisState("idle");
    } else {
      setErrorMessage(res.error?.message || "Unable to analyze the case right now. Please check backend connection and try again.");
      setAnalysisState("unavailable");
    }
  };

  if (isLoading) return <CardSkeleton />;

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-serif text-4xl font-bold">Case Intelligence</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
          Select one of your cases, or enter case details manually — LegalAI grounds the answer in statutory provisions,
          extracted facts, legal issues, and precedent citations.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 p-1.5">
        <button
          onClick={() => { setMode("existing"); setAnalysisState("idle"); setResult(null); setErrorMessage(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${mode === "existing" ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <ListChecks className="h-3.5 w-3.5" />Select Existing Case
        </button>
        <button
          onClick={() => { setMode("manual"); setAnalysisState("idle"); setResult(null); setErrorMessage(null); }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${mode === "manual" ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
        >
          <PenSquare className="h-3.5 w-3.5" />Enter Case Manually
        </button>
      </div>

      {mode === "existing" ? (
        cases.length === 0 ? (
          <EmptyState
            icon={<Gavel className="w-8 h-8" />}
            title="No cases available"
            description="Add a client or accept a client request to get cases here — or switch to Enter Case Manually to run an analysis right now."
            actionLabel="Enter Case Manually"
            onAction={() => setMode("manual")}
            className="p-16"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
            <Card variant="glass" className="p-4 h-fit">
              <p className="workspace-label mb-3">Your cases</p>
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setAnalysisState("idle"); setResult(null); setErrorMessage(null); setQuestion(""); }}
                  className={`mb-2 w-full rounded-xl border p-4 text-left transition-colors ${(selected?.id === c.id) ? "border-[var(--accent-gold)] bg-[var(--accent-gold-light)]" : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"}`}
                >
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">{c.court}</p>
                </button>
              ))}
            </Card>

            {selected ? (
              <div className="space-y-4">
                <Card variant="glass" className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant={statusToBadgeVariant(selected.status)}>{selected.status.replace("_", " ")}</Badge>
                      <h2 className="mt-2 font-serif text-2xl font-bold">{selected.title}</h2>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{selected.court}</p>
                    </div>
                    <Scale className="h-7 w-7 text-[var(--accent-gold)]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">What would you like to analyze?</span>
                      <textarea
                        rows={3}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. Examine whether the unilateral appointment of the arbitrator is valid under Section 12(5)."
                        className="lp-input mt-1.5 resize-none"
                      />
                    </label>
                    <Button onClick={runAnalysis} isLoading={analysisState === "running"} disabled={!canRun}>
                      <Sparkles className="mr-2 h-4 w-4" />Run Intelligence Pass
                    </Button>
                  </div>
                </Card>
                <AnalysisPanels analysisState={analysisState} result={result} errorMessage={errorMessage} />
              </div>
            ) : (
              <EmptyState title="Choose a case" description="Select one of your cases on the left to begin." className="p-12" />
            )}
          </div>
        )
      ) : (
        <div className="space-y-4 max-w-3xl">
          <Card variant="glass" className="p-6 space-y-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Case Facts & Details</span>
              <textarea
                rows={6}
                value={manualFacts}
                onChange={(e) => setManualFacts(e.target.value)}
                placeholder="Paste or describe the case facts — parties, chronology, documents, and anything else relevant…"
                className="lp-input mt-1.5 resize-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">What would you like to analyze?</span>
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Is the limitation period for filing this claim still open?"
                className="lp-input mt-1.5 resize-none"
              />
            </label>
            <Button onClick={runAnalysis} isLoading={analysisState === "running"} disabled={!canRun}>
              <Sparkles className="mr-2 h-4 w-4" />Run Intelligence Pass
            </Button>
          </Card>
          <AnalysisPanels analysisState={analysisState} result={result} errorMessage={errorMessage} />
        </div>
      )}
    </div>
  );
}

function AnalysisPanels({
  analysisState,
  result,
  errorMessage,
}: {
  analysisState: "idle" | "running" | "unavailable";
  result: CaseIntelligenceResult | null;
  errorMessage: string | null;
}) {
  if (analysisState === "running") {
    return (
      <Card variant="glass" className="p-6 flex items-center gap-3 border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)]/20">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-gold)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Running the Legal RAG reasoning pipeline…</p>
          <p className="text-xs text-[var(--text-secondary)]">Analyzing statutory acts, provisions, and precedents against Indian jurisprudence.</p>
        </div>
      </Card>
    );
  }

  if (analysisState === "unavailable" || errorMessage) {
    return (
      <Card variant="glass" className="border-rose-500/30 bg-rose-500/10 p-5">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <h3 className="font-serif font-bold text-rose-300">Analysis Error</h3>
            <p className="mt-1 text-xs leading-5 text-rose-200/90">
              {errorMessage || "Unable to complete analysis right now. Please try again."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2">
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--accent-gold)]" /><h3 className="font-serif font-bold">Facts Extracted</h3></div>
            <p className="mt-4 text-xs text-[var(--text-muted)] italic">Structured facts appear here after analysis.</p>
          </Card>
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2"><Gavel className="h-4 w-4 text-[var(--accent-gold)]" /><h3 className="font-serif font-bold">Relevant Law</h3></div>
            <p className="mt-4 text-xs text-[var(--text-muted)] italic">Applicable statutes and sections appear here after analysis.</p>
          </Card>
        </div>

        <Card variant="glass" className="p-5">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[var(--accent-gold)]" /><h3 className="font-serif font-bold">Relevant Precedents</h3></div>
          <p className="mt-4 text-xs text-[var(--text-muted)] italic">Matched precedents appear here after analysis.</p>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {result.summary && (
        <Card variant="glass" className="p-5 border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)]/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
            <h3 className="font-serif font-bold text-sm">Executive Legal Assessment</h3>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">{result.summary}</p>
        </Card>
      )}

      {/* Facts & Relevant Law */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="glass" className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--accent-gold)]" />
            <h3 className="font-serif font-bold">Facts Extracted</h3>
          </div>
          {result.facts?.overview && (
            <p className="text-xs text-[var(--text-secondary)]">{result.facts.overview}</p>
          )}
          {result.facts?.parties && (
            <div className="pt-2 border-t border-[var(--border-color)] text-xs">
              <span className="text-[var(--text-muted)]">Parties: </span>
              <span className="font-medium text-[var(--text-primary)]">{result.facts.parties.plaintiff || "N/A"}</span> vs{" "}
              <span className="font-medium text-[var(--text-primary)]">{result.facts.parties.defendant || "N/A"}</span>
            </div>
          )}
          {result.facts?.keyEvents && result.facts.keyEvents.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-[var(--border-color)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Chronology:</span>
              <ul className="list-disc pl-4 text-xs space-y-1 text-[var(--text-secondary)]">
                {result.facts.keyEvents.map((ke, idx) => (
                  <li key={idx}>
                    {ke.date && <span className="font-semibold text-[var(--text-primary)]">[{ke.date}] </span>}
                    {ke.event}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card variant="glass" className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4 text-[var(--accent-gold)]" />
            <h3 className="font-serif font-bold">Relevant Law & Statutes</h3>
          </div>
          {result.applicableLaws && result.applicableLaws.length > 0 ? (
            <div className="space-y-3">
              {result.applicableLaws.map((law, idx) => (
                <div key={idx} className="rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--accent-gold)]">{law.actName}</span>
                    <Badge size="sm" variant="gold">{law.section}</Badge>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">{law.title}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{law.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">No specific statutory provisions identified.</p>
          )}
        </Card>
      </div>

      {/* Relevant Precedents */}
      <Card variant="glass" className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--accent-gold)]" />
          <h3 className="font-serif font-bold">Relevant Precedents & Judgments</h3>
        </div>
        {result.precedents && result.precedents.length > 0 ? (
          <div className="space-y-3">
            {result.precedents.map((p, idx) => (
              <div key={p.id || idx} className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]/30 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{p.caseName}</h4>
                  <div className="flex items-center gap-2">
                    <Badge size="sm" variant="neutral">{p.court}</Badge>
                    <Badge size="sm" variant="gold">{p.citation}</Badge>
                    <span className="text-[10px] font-semibold text-emerald-400">
                      {Math.round((p.relevanceScore || 0.9) * 100)}% relevance
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{p.summary}</p>
                {p.whyRelevant && (
                  <p className="text-[11px] text-[var(--accent-gold)]/90 italic">
                    Why relevant: {p.whyRelevant}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic">No precedents cited for this scenario.</p>
        )}
      </Card>

      {/* Legal Issues & Recommended Steps */}
      {((result.issues && result.issues.length > 0) || (result.recommendedSteps && result.recommendedSteps.length > 0)) && (
        <div className="grid gap-4 md:grid-cols-2">
          {result.issues && result.issues.length > 0 && (
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm">Key Legal Issues</h3>
              </div>
              <div className="space-y-2">
                {result.issues.map((issue, idx) => (
                  <div key={issue.id || idx} className="border-l-2 border-amber-400 pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{issue.title}</span>
                      <Badge size="sm" variant={issue.severity === "HIGH" ? "danger" : issue.severity === "MEDIUM" ? "warning" : "neutral"}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">{issue.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.recommendedSteps && result.recommendedSteps.length > 0 && (
            <Card variant="glass" className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="font-serif font-bold text-sm">Recommended Next Steps</h3>
              </div>
              <ul className="space-y-2">
                {result.recommendedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function LawyerCaseIntelligencePage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LawyerCaseIntelligenceContent />
    </Suspense>
  );
}
