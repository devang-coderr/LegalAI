"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Precedent } from "@/types/case";

export default function PrecedentExplorerPage() {
  const [query, setQuery] = useState("Section 12(5) Arbitration Act unilateral appointment of arbitrator");
  const [selectedJudg, setSelectedJudg] = useState<Precedent | null>(null);

  const judgments: Precedent[] = [
    {
      id: "sc-2017-trf",
      caseName: "TRF Limited vs. Energo Engineering Projects Ltd.",
      citation: "(2017) 8 SCC 377",
      court: "Supreme Court of India",
      year: 2017,
      relevanceScore: 0.99,
      summary: "Appointment of Arbitrator - Ineligibility - Statutory Bar under Section 12(5).",
      whyRelevant: "An ineligible arbitrator under Section 12(5) read with Seventh Schedule cannot nominate another arbitrator. What cannot be done directly cannot be done indirectly.",
    },
    {
      id: "sc-2019-perkins",
      caseName: "Perkins Eastman Architects DPC vs. HSCC (India) Ltd.",
      citation: "(2020) 20 SCC 760",
      court: "Supreme Court of India",
      year: 2019,
      relevanceScore: 0.97,
      summary: "Sole Arbitrator - Unilateral Power of Appointment - Bias & Independence.",
      whyRelevant: "A person who has an interest in the outcome of the dispute is ineligible to appoint a sole arbitrator, even if the arbitration agreement grants such authority.",
    },
  ];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <Badge variant="violet">Precedent Database Engine</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Precedents & Ratio Decidendi Explorer
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Search over 500,000 ratio decidendi precedents with statutory exception filters.
        </p>
      </div>

      {/* Search Input */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search judgment title, section, or ratio..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            />
          </div>
          <Button variant="primary" className="w-full sm:w-auto text-xs py-3 bg-purple-600 hover:bg-purple-700">
            Search Precedents
          </Button>
        </div>
      </Card>

      {/* Judgment Results List */}
      <div className="space-y-4">
        {judgments.map((j) => (
          <Card key={j.id} variant="glass" className="p-6 space-y-3 hover:border-purple-500/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="gold" size="sm">{j.citation}</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif mt-1">
                  {j.caseName}
                </h3>
                <p className="text-xs text-purple-400 font-semibold">{j.court} ({j.year})</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedJudg(j)}>
                View Ratio & Citation
              </Button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
              <strong className="text-purple-300">Ratio Decidendi:</strong> {j.whyRelevant}
            </p>
          </Card>
        ))}
      </div>

      {/* Judgment Detail Drawer */}
      <Drawer
        isOpen={!!selectedJudg}
        onClose={() => setSelectedJudg(null)}
        title={selectedJudg?.caseName || "Judgment Citation"}
      >
        {selectedJudg && (
          <div className="space-y-6">
            <Badge variant="gold">{selectedJudg.citation}</Badge>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase">Summary</h4>
              <p className="text-xs text-[var(--text-primary)] font-medium">{selectedJudg.summary}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase">Full Binding Ratio</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                {selectedJudg.whyRelevant}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
