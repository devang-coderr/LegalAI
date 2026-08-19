"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gavel,
  BookOpen,
  FileText,
  UserCheck,
  Search,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CitizenDashboard() {
  const router = useRouter();
  const [problemQuery, setProblemQuery] = useState("");

  const handleSolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (problemQuery.trim()) {
      router.push(`/citizen/case-intelligence?query=${encodeURIComponent(problemQuery)}`);
    } else {
      router.push("/citizen/case-intelligence");
    }
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Welcome Banner & Instant Case Solver Input */}
      <div className="relative p-8 rounded-3xl glass-panel bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-amber-900/10 border border-blue-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="blue">Citizen AI Workspace</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)] mt-2">
              Hello, Anil. How can LegalAI assist you today?
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Describe any legal problem in plain language for instant analysis.
            </p>
          </div>
        </div>

        {/* Case Solver Input */}
        <form onSubmit={handleSolve} className="relative max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-blue-400 pointer-events-none" />
            <input
              type="text"
              value={problemQuery}
              onChange={(e) => setProblemQuery(e.target.value)}
              placeholder="Tell us what happened (e.g., Landlord refusing to return security deposit)..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-[var(--bg-card)]/90 border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 shadow-xl"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-2 text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Analyze Case
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Case Intelligence",
            desc: "AI Legal Problem Solver",
            icon: Gavel,
            color: "text-blue-400 bg-blue-500/10",
            href: "/citizen/case-intelligence",
          },
          {
            title: "Legal Research RAG",
            desc: "Supreme Court Precedents",
            icon: BookOpen,
            color: "text-purple-400 bg-purple-500/10",
            href: "/citizen/legal-research",
          },
          {
            title: "Document OCR",
            desc: "Contract & Risk Analyzer",
            icon: FileText,
            color: "text-amber-400 bg-amber-500/10",
            href: "/citizen/documents",
          },
          {
            title: "Find Advocates",
            desc: "Verified High Court Lawyers",
            icon: UserCheck,
            color: "text-emerald-400 bg-emerald-500/10",
            href: "/citizen/lawyers",
          },
        ].map((item, idx) => (
          <Link key={idx} href={item.href}>
            <Card variant="glass" className="p-5 space-y-3 hover:border-blue-500/40">
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

      {/* Recent Analyses & Case Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Recent Case Analyses
            </h3>
            <Link href="/citizen/case-intelligence" className="text-xs text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Property Ancestral Title Claim",
                date: "14 Aug 2026",
                act: "Section 44 Transfer of Property Act",
                status: "COMPLETED",
              },
              {
                title: "Employment Agreement Non-Compete Risk",
                date: "02 Aug 2026",
                act: "Section 27 Indian Contract Act",
                status: "RISK DETECTED",
              },
            ].map((c, idx) => (
              <Card key={idx} variant="glass" className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Badge variant={c.status === "COMPLETED" ? "success" : "warning"} size="sm">
                    {c.status}
                  </Badge>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] font-serif">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{c.act}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-[10px] text-[var(--text-muted)]">{c.date}</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Output
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Hearing & Timeline Summary */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
            Case Timeline Highlight
          </h3>
          <Card variant="parchment" className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs font-serif">
              <Clock className="w-4 h-4" />
              <span>Next Hearing Scheduled</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Court Notice Reply Due
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Hearing Date: 28 August 2026 at High Court of Delhi (Courtroom 14).
            </p>
            <Link href="/citizen/timeline">
              <Button variant="gold" size="sm" className="w-full mt-2 text-xs">
                View Full Timeline
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
