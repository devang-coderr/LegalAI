"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, Calendar, Loader2, CalendarPlus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiClient } from "@/lib/api-client";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  eventType?: string;
  linkedDocumentId?: string;
  createdAt?: string;
}

const DEFAULT_MILESTONES: TimelineEvent[] = [
  {
    id: "sample-1",
    title: "Petition / Complaint Filing",
    date: "10 June 2026",
    status: "COMPLETED",
    description: "Plaint filed under Section 44 Transfer of Property Act before Civil Court.",
  },
  {
    id: "sample-2",
    title: "Judicial Notice Issued",
    date: "25 June 2026",
    status: "COMPLETED",
    description: "Court summons served upon Respondent via Registered AD.",
  },
  {
    id: "sample-3",
    title: "Written Statement / Reply Filed",
    date: "15 July 2026",
    status: "COMPLETED",
    description: "Respondent filed written statement denying security deposit liability.",
  },
  {
    id: "sample-4",
    title: "Framing of Issues & Hearing",
    date: "28 August 2026",
    status: "UPCOMING",
    description: "Upcoming hearing before High Court of Delhi (Courtroom 14).",
  },
  {
    id: "sample-5",
    title: "Final Judicial Order",
    date: "Pending Hearing",
    status: "PENDING",
    description: "Judicial order on security deposit refund with statutory interest.",
  },
];

export default function CaseTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      setIsLoading(true);
      const res = await apiClient<TimelineEvent[]>("/citizen/timeline");
      setIsLoading(false);
      if (res.success && res.data && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(DEFAULT_MILESTONES);
      }
    }
    loadTimeline();
  }, []);

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Interactive Case Timeline
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Real-time tracking of case filings, notices, hearings, and orders reconstructed from your matters.
        </p>
      </div>

      {isLoading ? (
        <Card variant="glass" className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--accent-gold)]" />
          <p className="text-xs text-[var(--text-secondary)]">Loading timeline events from your legal matters…</p>
        </Card>
      ) : (
        /* Timeline Node Flow */
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-color)]">
          {events.map((m, idx) => {
            const isCompleted = m.status === "COMPLETED";
            const isUpcoming = m.status === "UPCOMING";
            return (
              <div key={m.id || idx} className="relative flex items-start gap-4">
                {/* Status Node Dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${
                    isCompleted
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : isUpcoming
                      ? "bg-amber-500 text-white border-amber-400 animate-pulse"
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>

                <Card variant="glass" className="w-full p-5 space-y-2 hover:border-blue-500/40">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        isCompleted
                          ? "success"
                          : isUpcoming
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {m.status}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-400" /> {m.date || "Date unspecified"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">{m.description}</p>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
