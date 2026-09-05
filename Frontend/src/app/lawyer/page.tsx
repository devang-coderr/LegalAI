"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ActiveCaseCard } from "@/components/lawyer/ActiveCaseCard";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { getSession, type SessionUser } from "@/lib/auth";

export default function LawyerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const { activeCases, stats, isLoading } = useLawyerCases();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note in citizen/page.tsx
    setUser(getSession());
  }, []);

  const dashboardCases = activeCases.slice(0, 2);
  const hasMore = activeCases.length > 2;

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl glass-panel bg-gradient-to-r from-[var(--accent-gold-light)] via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)]">
            {user?.name ? (
              <>Welcome back, {user.name}</>
            ) : (
              <span className="inline-block h-8 w-64 max-w-full rounded-lg bg-[var(--border-color)] animate-pulse align-middle" />
            )}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Your LegalAI litigation workspace.
          </p>
        </div>

        <Link href="/lawyer/hearings">
          <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Prepare Hearings
          </Button>
        </Link>
      </div>

      {/* Case Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Cases", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Settled", value: stats.settled },
          { label: "Closed", value: stats.closed },
        ].map((m) => (
          <Card key={m.label} variant="glass" className="p-5 space-y-1">
            <h3 className="text-3xl font-extrabold font-serif text-[var(--accent-gold)]">{m.value}</h3>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Active Cases & Legal Research Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">Active Cases</h3>
            {activeCases.length > 0 && (
              <Link href="/lawyer/cases" className="text-xs text-[var(--accent-gold)] hover:underline">
                {hasMore ? "View All Cases" : "View My Cases"}
              </Link>
            )}
          </div>

          {isLoading ? (
            <CardSkeleton />
          ) : dashboardCases.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-8 h-8" />}
              title="No active cases yet"
              description="Cases that you accept or create on LegalAI will appear here."
              actionLabel="Go to My Cases"
              onAction={() => router.push("/lawyer/cases")}
            />
          ) : (
            <div className="space-y-3">
              {dashboardCases.map((c) => (
                <ActiveCaseCard key={c.id} caseItem={c} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Legal Research */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
            Legal Research
          </h3>
          <Card variant="glass" className="p-5 space-y-4 border-[var(--accent-gold)]/30">
            <div className="flex items-center gap-2 text-[var(--accent-gold)] text-xs font-semibold">
              <Search className="w-4 h-4" />
              <span>Statutory & Case Law Research</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Search Indian statutes, case laws, provisions, and legal principles with AI intelligence.
            </p>
            <Link href="/lawyer/legal-research">
              <Button variant="gold" size="sm" className="w-full">
                Open Legal Research
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
