"use client";

import React from "react";
import { Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HearingPreparationPage() {
  const hearings = [
    {
      id: "h-1",
      caseTitle: "M/s Apex Infrastructure vs. Union of India",
      court: "Supreme Court of India",
      courtroom: "Courtroom 3 (Item 18)",
      date: "28 August 2026",
      time: "10:30 AM",
      stage: "Arguments on Section 11 Appointment",
      aiNotes: "Focus oral arguments on TRF Ltd. 3-judge bench precedent regarding arbitrator ineligibility.",
    },
    {
      id: "h-2",
      caseTitle: "Sharma Land Holdings vs. State of Delhi",
      court: "High Court of Delhi",
      courtroom: "Courtroom 14 (Item 07)",
      date: "05 September 2026",
      time: "11:45 AM",
      stage: "Writ Admission Hearing",
      aiNotes: "Submit affidavit proving continuous possession under Section 54 Transfer of Property Act.",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <Badge variant="gold">Court Hearing Strategy</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Hearing Preparation Suite
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Organize upcoming court hearings, review AI strategy notes, and generate argument briefs.
        </p>
      </div>

      <div className="space-y-4">
        {hearings.map((h) => (
          <Card key={h.id} variant="glass" className="p-6 space-y-4 hover:border-amber-500/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div>
                <Badge variant="warning">{h.stage}</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif mt-1">
                  {h.caseTitle}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{h.court} • {h.courtroom}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[var(--text-primary)] block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> {h.date}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">{h.time}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 font-serif">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Hearing Strategy Brief</span>
              </div>
              <p className="text-[var(--text-secondary)]">{h.aiNotes}</p>
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700 font-serif">
                Generate Synopsis Brief
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
