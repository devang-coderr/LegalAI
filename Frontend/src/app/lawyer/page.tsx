"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LawyerDashboard() {
  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl glass-panel bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-blue-900/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="violet">Senior Counsel Suite</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)]">
            Welcome back, Adv. Rajesh Sharma
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            High Court of Delhi & Supreme Court Litigation Workspace. 3 hearings scheduled for this week.
          </p>
        </div>

        <Link href="/lawyer/hearings">
          <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Prepare Hearings
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Litigations", value: "14", detail: "Delhi High Court & SC", color: "text-purple-400" },
          { label: "Upcoming Hearings", value: "3", detail: "Next: 28 August 2026", color: "text-amber-400" },
          { label: "Precedents Matched", value: "128", detail: "RAG Ratio Engine", color: "text-emerald-400" },
          { label: "Draft Petitions", value: "5", detail: "Pending Review", color: "text-blue-400" },
        ].map((m, idx) => (
          <Card key={idx} variant="glass" className="p-5 space-y-1">
            <h3 className={`text-3xl font-extrabold font-serif ${m.color}`}>{m.value}</h3>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{m.label}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{m.detail}</p>
          </Card>
        ))}
      </div>

      {/* Quick Navigation Cards & Case Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Active Case Registry
            </h3>
            <Link href="/lawyer/cases" className="text-xs text-purple-400 hover:underline">
              View Full Registry
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "case-101",
                title: "M/s Apex Infrastructure vs. Union of India",
                court: "Supreme Court of India (Bench 3)",
                act: "Article 226 / Arbitration Act Section 11",
                stage: "Final Arguments",
              },
              {
                id: "case-102",
                title: "Sharma Land Holdings vs. State of Delhi",
                court: "Delhi High Court (Court 14)",
                act: "Transfer of Property Act Section 54",
                stage: "Notice Reply",
              },
            ].map((c) => (
              <Card key={c.id} variant="glass" className="p-5 flex items-center justify-between hover:border-purple-500/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="violet" size="sm">{c.stage}</Badge>
                    <span className="text-[11px] text-purple-400 font-medium">{c.court}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{c.act}</p>
                </div>
                <Link href={`/lawyer/cases/${c.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Deep Insights
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Precedent Search */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
            Precedent Search Shortcut
          </h3>
          <Card variant="glass" className="p-5 space-y-4 border-purple-500/30">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Ratio Decidendi Search</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Find precedents by section provision or statutory exception.
            </p>
            <Link href="/lawyer/precedents">
              <Button variant="primary" size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                Open Precedents Database
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
