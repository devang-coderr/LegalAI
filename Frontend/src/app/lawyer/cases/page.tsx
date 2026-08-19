"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LawyerCasesPage() {
  const cases = [
    {
      id: "case-101",
      title: "M/s Apex Infrastructure vs. Union of India",
      court: "Supreme Court of India",
      bench: "Bench 3 (Justice R.F. Nariman)",
      act: "Arbitration & Conciliation Act Section 11 / Section 34",
      status: "ACTIVE LITIGATION",
      client: "M/s Apex Infrastructure Ltd.",
      nextHearing: "28 Aug 2026",
    },
    {
      id: "case-102",
      title: "Sharma Land Holdings vs. State of Delhi",
      court: "Delhi High Court",
      bench: "Courtroom 14 (Single Bench)",
      act: "Transfer of Property Act Section 54",
      status: "NOTICE REPLY DUE",
      client: "Rajesh Sharma & Ors.",
      nextHearing: "05 Sept 2026",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <Badge variant="violet">Active Case Registry</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Litigation Case Registry
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Manage active Supreme Court and High Court litigations with AI ratio decidendi matching.
        </p>
      </div>

      <div className="space-y-4">
        {cases.map((c) => (
          <Card key={c.id} variant="glass" className="p-6 space-y-4 hover:border-purple-500/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div>
                <Badge variant="violet" size="sm">{c.status}</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif mt-1">
                  {c.title}
                </h3>
                <p className="text-xs text-purple-400 font-medium">{c.court} ({c.bench})</p>
              </div>
              <Link href={`/lawyer/cases/${c.id}`}>
                <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Deep Insights
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-muted)] block">Client:</span>
                <span className="font-semibold text-[var(--text-primary)]">{c.client}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Statutory Provisions:</span>
                <span className="font-semibold text-[var(--text-primary)]">{c.act}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Next Hearing Date:</span>
                <span className="font-semibold text-amber-400">{c.nextHearing}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
