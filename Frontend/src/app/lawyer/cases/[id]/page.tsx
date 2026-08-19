"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  BookOpen,
  Scale,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function DeepCaseInsightsPage() {
  const params = useParams();
  const caseId = params?.id || "case-101";
  const [activeTab, setActiveTab] = useState("facts");

  const tabs = [
    { id: "facts", label: "Case Facts & Chronology", icon: <FileText className="w-4 h-4" /> },
    { id: "provisions", label: "Statutory Provisions", icon: <BookOpen className="w-4 h-4" /> },
    { id: "precedents", label: "Ratio Decidendi Precedents", icon: <Scale className="w-4 h-4" /> },
    { id: "contradictions", label: "Contradictions & Risks", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "strategy", label: "AI Strategy Notes", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Case Header */}
      <div className="p-6 rounded-2xl glass-panel border border-purple-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="violet">Supreme Court Litigation</Badge>
          <span className="text-xs text-[var(--text-muted)]">ID: {caseId}</span>
        </div>
        <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
          M/s Apex Infrastructure vs. Union of India
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Arbitration & Conciliation Act Section 11 (Appointment of Arbitrator) & Section 34 (Setting Aside Award)
        </p>
      </div>

      {/* Structured Insight Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content Panels */}
      <div className="space-y-6">
        {activeTab === "facts" && (
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Chronological Fact Matrix
            </h3>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-primary)] block">12 March 2024:</strong> Commercial concession agreement executed with 24-month completion deadline.
              </li>
              <li className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-primary)] block">05 Nov 2025:</strong> Unilateral termination notice issued by Respondent invoking liquidated damages.
              </li>
              <li className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-primary)] block">18 Jan 2026:</strong> Section 21 Arbitration notice issued demanding sole arbitrator nomination.
              </li>
            </ul>
          </Card>
        )}

        {activeTab === "provisions" && (
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Applicable Statutory Provisions
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="font-bold text-purple-300 font-serif">Section 12(5) Arbitration & Conciliation Act, 1996</span>
                <p className="text-[var(--text-secondary)]">
                  Ineligibility of employee or officer of party to act as sole arbitrator without express written waiver.
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "precedents" && (
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Matching Supreme Court Ratio Decidendi
            </h3>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 font-serif">TRF Ltd. vs. Energo Engineering Projects (2017) 8 SCC 377</span>
                <Badge variant="success">99.1% Ratio Match</Badge>
              </div>
              <p className="text-[var(--text-secondary)]">
                By operation of law, once an arbitrator becomes ineligible under Section 12(5), he cannot nominate another arbitrator.
              </p>
            </div>
          </Card>
        )}

        {activeTab === "contradictions" && (
          <Card variant="glass" className="p-6 space-y-4 border-rose-500/30">
            <h3 className="text-base font-bold font-serif text-rose-300">
              Evidentiary Contradictions & Risk Analysis
            </h3>
            <div className="p-3 rounded-xl bg-rose-500/10 text-xs text-rose-200">
              Respondent&apos;s written statement contradicts Clause 22.4 regarding force majeure extension approvals.
            </div>
          </Card>
        )}

        {activeTab === "strategy" && (
          <Card variant="parchment" className="p-6 space-y-4">
            <h3 className="text-base font-bold font-serif text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Generated Litigation Strategy Notes</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Emphasize TRF Ltd. and Perkins Eastman precedents during oral arguments to invalidate Respondent&apos;s unilateral arbitrator appointment list.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
