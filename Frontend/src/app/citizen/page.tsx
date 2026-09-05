"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gavel,
  FileText,
  UserCheck,
  Clock,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getSession, type SessionUser } from "@/lib/auth";
import { currentUserId, readBucket } from "@/lib/workspace-store";
import { CITIZEN_BUCKETS, type RecentAnalysis, type TimelineEvent } from "@/types/citizen";

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([]);
  const [timelineHighlight, setTimelineHighlight] = useState<TimelineEvent | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    // Reads browser-only session/localStorage state after hydration. Doing
    // this in an effect (rather than a lazy useState initializer) is
    // intentional: it keeps the server-rendered HTML and the client's first
    // paint identical, avoiding a hydration mismatch, then swaps in the real
    // session/local data once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getSession());
    const userId = currentUserId();
    const nextAnalyses = readBucket<RecentAnalysis>(CITIZEN_BUCKETS.analyses, userId);
    const timeline = readBucket<TimelineEvent>(CITIZEN_BUCKETS.timeline, userId);
    setAnalyses(nextAnalyses);
    setTimelineHighlight(timeline.find((t) => t.status === "UPCOMING") ?? timeline[0] ?? null);
    setLoadingActivity(false);
  }, []);

  const quickActions = [
    {
      title: "Case Intelligence",
      desc: "AI-assisted legal problem solver",
      icon: Gavel,
      color: "text-[var(--accent-gold)] bg-[var(--accent-gold-light)]",
      href: "/citizen/case-intelligence",
    },
    {
      title: "Documents",
      desc: "Upload, organize and understand documents",
      icon: FileText,
      color: "text-amber-400 bg-amber-500/10",
      href: "/citizen/documents",
    },
    {
      title: "My Cases",
      desc: "Track your ongoing legal matters",
      icon: FolderOpen,
      color: "text-emerald-400 bg-emerald-500/10",
      href: "/citizen/cases",
    },
    {
      title: "Find a Lawyer",
      desc: "Get matched with verified advocates",
      icon: UserCheck,
      color: "text-blue-400 bg-blue-500/10",
      href: "/citizen/lawyers",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-3xl glass-panel bg-gradient-to-r from-[var(--accent-gold-light)] via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)]">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)]">
          {user?.name ? (
            <>Hello, {user.name}. How can LegalAI assist you today?</>
          ) : (
            <span className="inline-block h-8 w-64 max-w-full rounded-lg bg-[var(--border-color)] animate-pulse align-middle" />
          )}
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Describe any legal problem in plain language for instant analysis, or pick up where you left off below.
        </p>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((item, idx) => (
          <Link key={idx} href={item.href}>
            <Card variant="glass" className="p-5 space-y-3 hover:border-[var(--accent-gold)]/40">
              <div className={`p-3 w-fit rounded-xl ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-serif">{item.title}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Analyses & Case Timeline Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Case Analysis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Recent Case Analysis
            </h3>
            {analyses.length > 0 && (
              <Link href="/citizen/case-intelligence" className="text-xs text-[var(--accent-gold)] hover:underline">
                View All
              </Link>
            )}
          </div>

          {loadingActivity ? (
            <div className="space-y-3">
              <CardSkeleton />
            </div>
          ) : analyses.length === 0 ? (
            <EmptyState
              icon={<Gavel className="w-8 h-8" />}
              title="No recent case analysis"
              description="Describe a legal issue in Case Intelligence and your recent analyses will appear here."
              actionLabel="Start Case Intelligence"
              onAction={() => router.push("/citizen/case-intelligence")}
            />
          ) : (
            <div className="space-y-3">
              {analyses.map((a) => (
                <Card key={a.id} variant="glass" className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <Badge variant="gold" size="sm">Analyzed</Badge>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] font-serif truncate">
                      {a.query}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{a.summary}</p>
                  </div>
                  <div className="text-right space-y-2 shrink-0">
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <Link href="/citizen/case-intelligence">
                      <Button variant="outline" size="sm" className="text-xs">
                        View Output
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Case Timeline Highlight */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
            Case Timeline Highlight
          </h3>
          {loadingActivity ? (
            <CardSkeleton />
          ) : timelineHighlight ? (
            <Card variant="parchment" className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs font-serif">
                <Clock className="w-4 h-4" />
                <span>{timelineHighlight.status === "UPCOMING" ? "Next Milestone" : "Latest Update"}</span>
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {timelineHighlight.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">{timelineHighlight.description}</p>
              <Link href="/citizen/timeline">
                <Button variant="gold" size="sm" className="w-full mt-2 text-xs">
                  View Full Timeline
                </Button>
              </Link>
            </Card>
          ) : (
            <EmptyState
              icon={<Clock className="w-8 h-8" />}
              title="No Case Timeline Highlight"
              description="Once your case has tracked milestones, the next one will be highlighted here."
              className="p-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
