"use client";

import React from "react";
import { Clock, CheckCircle2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CaseTimelinePage() {
  const milestones = [
    {
      title: "Petition / Complaint Filing",
      date: "10 June 2026",
      status: "COMPLETED",
      desc: "Plaint filed under Section 44 Transfer of Property Act before Civil Court.",
    },
    {
      title: "Judicial Notice Issued",
      date: "25 June 2026",
      status: "COMPLETED",
      desc: "Court summons served upon Respondent via Registered AD.",
    },
    {
      title: "Written Statement / Reply Filed",
      date: "15 July 2026",
      status: "COMPLETED",
      desc: "Respondent filed written statement denying security deposit liability.",
    },
    {
      title: "Framing of Issues & Hearing",
      date: "28 August 2026",
      status: "UPCOMING",
      desc: "Upcoming hearing before High Court of Delhi (Courtroom 14).",
    },
    {
      title: "Final Judicial Order",
      date: "Pending Hearing",
      status: "PENDING",
      desc: "Judicial order on security deposit refund with statutory interest.",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="blue">Milestone Tracker</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Interactive Case Timeline
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Real-time tracking of case filings, notices, hearings, and orders.
        </p>
      </div>

      {/* Timeline Node Flow */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-color)]">
        {milestones.map((m, idx) => (
          <div key={idx} className="relative flex items-start gap-4">
            {/* Status Node Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border ${
                m.status === "COMPLETED"
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : m.status === "UPCOMING"
                  ? "bg-amber-500 text-white border-amber-400 animate-pulse"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]"
              }`}
            >
              {m.status === "COMPLETED" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>

            <Card variant="glass" className="w-full p-5 space-y-2 hover:border-blue-500/40">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    m.status === "COMPLETED"
                      ? "success"
                      : m.status === "UPCOMING"
                      ? "warning"
                      : "neutral"
                  }
                  size="sm"
                >
                  {m.status}
                </Badge>
                <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" /> {m.date}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">
                {m.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">{m.desc}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
