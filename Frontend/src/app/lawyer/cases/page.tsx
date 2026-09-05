"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { statusToBadgeVariant } from "@/lib/case-status";

const FILTERS = ["All", "Active", "Settled", "Closed"] as const;
type Filter = (typeof FILTERS)[number];

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-rose-400",
  MEDIUM: "text-amber-400",
  LOW: "text-[var(--text-muted)]",
};

export default function LawyerCasesPage() {
  const router = useRouter();
  const { cases, isLoading, error, reload } = useLawyerCases();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return cases;
    if (filter === "Active") return cases.filter((c) => c.status === "ACTIVE" || c.status === "UPCOMING_HEARING");
    if (filter === "Settled") return cases.filter((c) => c.status === "SETTLED");
    return cases.filter((c) => c.status === "CLOSED");
  }, [cases, filter]);

  const counts = {
    All: cases.length,
    Active: cases.filter((c) => c.status === "ACTIVE" || c.status === "UPCOMING_HEARING").length,
    Settled: cases.filter((c) => c.status === "SETTLED").length,
    Closed: cases.filter((c) => c.status === "CLOSED").length,
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">My Cases</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Your complete case registry, organized by status.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : cases.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" />}
          title="No cases yet"
          description="Cases will appear here after you accept a client request, or you add a client directly."
          actionLabel="View Client Requests"
          onAction={() => router.push("/lawyer/notifications")}
          className="p-16"
        />
      ) : (
        <>
          <Tabs
            tabs={FILTERS.map((f) => ({ id: f, label: f, count: counts[f] }))}
            activeTab={filter}
            onChange={(id) => setFilter(id as Filter)}
          />

          <div className="space-y-4">
            {filtered.map((c) => (
              <Card key={c.id} variant="glass" className="p-6 space-y-4 hover:border-[var(--accent-gold)]/40">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusToBadgeVariant(c.status)} size="sm">{c.status.replace("_", " ")}</Badge>
                      {c.caseNumber && <span className="text-[10px] text-[var(--text-muted)]">{c.caseNumber}</span>}
                      {c.priority && <span className={`text-[10px] font-semibold uppercase ${PRIORITY_COLOR[c.priority]}`}>{c.priority} priority</span>}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif mt-1">{c.title}</h3>
                    <p className="text-xs text-[var(--accent-gold)] font-medium">{c.court}{c.bench ? ` (${c.bench})` : ""}</p>
                  </div>
                  <Link href={`/lawyer/cases/${c.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Open Case
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs text-[var(--text-secondary)]">
                  <div>
                    <span className="text-[var(--text-muted)] block">Client</span>
                    <span className="font-semibold text-[var(--text-primary)]">{c.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Case Type</span>
                    <span className="font-semibold text-[var(--text-primary)]">{c.caseType || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Statutory Provisions</span>
                    <span className="font-semibold text-[var(--text-primary)]">{c.statutoryActs}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Next Hearing</span>
                    <span className="font-semibold text-amber-400">{c.nextHearingDate || "Not scheduled"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block">Assigned Lawyer</span>
                    <span className="font-semibold text-[var(--text-primary)]">{c.assignedLawyer || "—"}</span>
                  </div>
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <h3 className="text-sm font-semibold">No {filter.toLowerCase()} cases</h3>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
