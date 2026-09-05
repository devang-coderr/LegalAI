"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Book,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Gavel,
  Loader2,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { statusToBadgeVariant } from "@/lib/case-status";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { useHearings } from "@/hooks/useHearings";
import { useLawyerDocuments } from "@/hooks/useLawyerDocuments";
import { analyzeCaseIntelligence } from "@/services/case.api";

const HEARING_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "blue"> = {
  SCHEDULED: "blue", COMPLETED: "success", ADJOURNED: "warning", CANCELLED: "danger",
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = String(params?.id || "");
  const [activeTab, setActiveTab] = useState("facts");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const { cases, isLoading, reload } = useLawyerCases();
  const { hearingsForCase } = useHearings();
  const { documentsForCase } = useLawyerDocuments();

  const item = cases.find((c) => c.id === caseId);

  if (isLoading) return <CardSkeleton />;

  if (!item) {
    return (
      <EmptyState
        title="Case not found"
        description="This case may have been removed, or the link is out of date."
        actionLabel="Back to My Cases"
        onAction={() => router.push("/lawyer/cases")}
        className="p-16"
      />
    );
  }

  const hearings = hearingsForCase(item.id);
  const documents = documentsForCase(item.id);
  const intelligence = item.intelligence;

  const handleRunIntelligence = async () => {
    setIsRunningAnalysis(true);
    setAnalysisError(null);
    try {
      const query = `${item.title}. ${item.description || ""}`;
      const res = await analyzeCaseIntelligence(query, item.id);
      if (res.success) {
        await reload();
      } else {
        setAnalysisError(res.error?.message || "Failed to run Case Intelligence. Please try again.");
      }
    } catch {
      setAnalysisError("An unexpected error occurred while analyzing the case.");
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const tabs = [
    { id: "facts", label: "Case Facts", icon: <FileText className="w-4 h-4" /> },
    { id: "provisions", label: "Statutory Provisions", icon: <BookOpen className="w-4 h-4" /> },
    { id: "precedents", label: "Precedents", icon: <Scale className="w-4 h-4" /> },
    { id: "risks", label: "Risks & Strategy", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "hearings", label: "Hearings", icon: <Calendar className="w-4 h-4" />, count: hearings.length },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Case Header Card */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusToBadgeVariant(item.status)}>{item.status.replace("_", " ")}</Badge>
              {item.caseNumber && <span className="text-xs text-[var(--text-muted)]">{item.caseNumber}</span>}
            </div>
            <h1 className="mt-2 text-2xl font-bold font-serif">{item.title}</h1>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.court}{item.bench ? ` (${item.bench})` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {item.clientId && (
              <Link href={`/lawyer/clients/${item.clientId}`}>
                <Button variant="outline" size="sm" leftIcon={<UserRound className="w-3.5 h-3.5" />}>View Client</Button>
              </Link>
            )}
            <Button
              variant="gold"
              size="sm"
              isLoading={isRunningAnalysis}
              onClick={handleRunIntelligence}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {intelligence ? "Refresh Intelligence" : "Run Case Intelligence"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Info label="Case Type" value={item.caseType || "—"} />
          <Info label="Priority" value={item.priority || "—"} />
          <Info label="Assigned Lawyer" value={item.assignedLawyer || "—"} />
          <Info label="Next Hearing" value={item.nextHearingDate || "Not scheduled"} accent />
        </div>
        {item.description && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>}

        {analysisError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{analysisError}</span>
          </div>
        )}
      </Card>

      {/* Executive Summary banner if intelligence exists */}
      {intelligence?.summary && (
        <Card variant="glass" className="p-5 border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)]/10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
            <h3 className="font-serif font-bold text-sm">Case Intelligence Legal Assessment</h3>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">{intelligence.summary}</p>
        </Card>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Facts Tab */}
      {activeTab === "facts" && (
        intelligence?.facts ? (
          <div className="space-y-4">
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="font-serif font-bold text-base">Case Facts & Background</h3>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{intelligence.facts.overview}</p>

              {intelligence.facts.parties && (
                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[var(--bg-secondary)]/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">Complainant / Plaintiff</span>
                    <span className="font-medium text-[var(--text-primary)]">{intelligence.facts.parties.plaintiff || item.clientName}</span>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-secondary)]/40 p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">Opposite Party / Defendant</span>
                    <span className="font-medium text-[var(--text-primary)]">{intelligence.facts.parties.defendant || "Opposite Party / Employer"}</span>
                  </div>
                </div>
              )}

              {intelligence.facts.keyEvents && intelligence.facts.keyEvents.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Chronology of Events</h4>
                  <div className="space-y-2">
                    {intelligence.facts.keyEvents.map((ke, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs rounded-lg border border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/30 p-3">
                        {ke.date && (
                          <Badge size="sm" variant="neutral" className="shrink-0 font-mono">
                            {ke.date}
                          </Badge>
                        )}
                        <span className="text-[var(--text-secondary)] pt-0.5">{ke.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="font-serif font-bold">Case Facts</h3>
            <p className="text-xs text-[var(--text-muted)] italic">
              Structured facts extracted by LegalAI will appear here once Case Intelligence is executed.
            </p>
            <Button variant="outline" size="sm" isLoading={isRunningAnalysis} onClick={handleRunIntelligence} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Run Case Intelligence
            </Button>
          </Card>
        )
      )}

      {/* Provisions Tab */}
      {activeTab === "provisions" && (
        <div className="space-y-4">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="font-serif font-bold text-base">Applicable Statutory Provisions</h3>
              </div>
              <Badge variant="gold">{item.statutoryActs}</Badge>
            </div>

            {intelligence?.applicableLaws && intelligence.applicableLaws.length > 0 ? (
              <div className="space-y-3 pt-2">
                {intelligence.applicableLaws.map((law, idx) => (
                  <div key={idx} className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]/40 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[var(--accent-gold)]">{law.actName}</span>
                      <Badge size="sm" variant="gold">{law.section}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{law.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{law.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-2 space-y-3">
                <p className="text-xs text-[var(--text-muted)] italic">
                  Detailed statutory provisions and section explanations will appear here after Case Intelligence analysis.
                </p>
                <Button variant="outline" size="sm" isLoading={isRunningAnalysis} onClick={handleRunIntelligence} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Analyze Statutory Provisions
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Precedents Tab */}
      {activeTab === "precedents" && (
        <div className="space-y-4">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="font-serif font-bold text-base">Relevant Precedents & Judgments</h3>
              </div>
              <Link href="/lawyer/legal-research">
                <Button variant="outline" size="sm" leftIcon={<Book className="w-3.5 h-3.5" />}>Search Legal Research</Button>
              </Link>
            </div>

            {intelligence?.precedents && intelligence.precedents.length > 0 ? (
              <div className="space-y-3 pt-2">
                {intelligence.precedents.map((p, idx) => (
                  <div key={p.id || idx} className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]/30 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{p.caseName}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge size="sm" variant="neutral">{p.court}</Badge>
                        <Badge size="sm" variant="gold">{p.citation}</Badge>
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {Math.round((p.relevanceScore || 0.9) * 100)}% relevance
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.summary}</p>
                    {p.whyRelevant && (
                      <p className="text-[11px] text-[var(--accent-gold)]/90 italic pt-1 border-t border-[var(--border-color)]/60">
                        Why relevant: {p.whyRelevant}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-2 space-y-3">
                <p className="text-xs text-[var(--text-muted)] italic">
                  Matched judicial precedents and case citations will appear here after analysis.
                </p>
                <Button variant="outline" size="sm" isLoading={isRunningAnalysis} onClick={handleRunIntelligence} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Find Precedents
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Risks & Strategy Tab */}
      {activeTab === "risks" && (
        <div className="space-y-4">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-bold text-base">Key Legal Issues & Procedural Risks</h3>
            </div>

            {intelligence?.issues && intelligence.issues.length > 0 ? (
              <div className="space-y-3 pt-2">
                {intelligence.issues.map((issue, idx) => (
                  <div key={issue.id || idx} className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]/40 border-l-4 border-l-amber-400 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{issue.title}</span>
                      <Badge size="sm" variant={issue.severity === "HIGH" ? "danger" : issue.severity === "MEDIUM" ? "warning" : "neutral"}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{issue.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic pt-2">
                Identified legal issues and procedural risks will appear here after Case Intelligence analysis.
              </p>
            )}

            {intelligence?.recommendedSteps && intelligence.recommendedSteps.length > 0 && (
              <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h4 className="font-serif font-bold text-sm">Recommended Next Steps</h4>
                </div>
                <ul className="space-y-2">
                  {intelligence.recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)]/30 rounded-lg p-2.5 border border-[var(--border-color)]/60">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!intelligence && (
              <Button variant="outline" size="sm" isLoading={isRunningAnalysis} onClick={handleRunIntelligence} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Analyze Risks & Strategy
              </Button>
            )}
          </Card>
        </div>
      )}

      {/* Hearings Tab */}
      {activeTab === "hearings" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link href={`/lawyer/hearings?caseId=${item.id}`}>
              <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>Schedule Hearing</Button>
            </Link>
          </div>
          {hearings.length === 0 ? (
            <EmptyState icon={<Calendar className="w-8 h-8" />} title="No hearings scheduled for this case yet." className="p-12" />
          ) : (
            hearings.map((h) => (
              <Link key={h.id} href={`/lawyer/hearings/${h.id}`}>
                <Card variant="glass" className="p-4 flex items-center justify-between gap-3 hover:border-[var(--accent-gold)]/40">
                  <div>
                    <Badge variant={HEARING_STATUS_VARIANT[h.status]} size="sm">{h.status}</Badge>
                    <p className="text-sm font-semibold mt-1">{h.hearingType}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{h.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{h.date}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{h.time}</p>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Case Documents Section */}
      {documents.length > 0 && (
        <Card variant="glass" className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold font-serif"><FileText className="w-4 h-4 text-[var(--accent-gold)]" />Case Documents</div>
          <ul className="space-y-1.5">
            {documents.map((d) => (
              <li key={d.id}><a href={d.objectUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)]">{d.fileName}</a></li>
            ))}
          </ul>
        </Card>
      )}

      {/* Bottom Navigation Shortcut */}
      <div className="flex items-center justify-between pt-2">
        <Link href={`/lawyer/case-intelligence?caseId=${item.id}`}>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />Open in Dedicated Case Intelligence Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] p-3">
      <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
      <p className={`text-xs font-semibold truncate ${accent ? "text-amber-400" : ""}`}>{value}</p>
    </div>
  );
}
