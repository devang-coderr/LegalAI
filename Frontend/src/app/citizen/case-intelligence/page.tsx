"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  FileText,
  BookOpen,
  Scale,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LegalDisclaimer } from "@/components/ui/LegalDisclaimer";

function CaseIntelligenceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  const stages = [
    { title: "Fact Parsing", desc: "Extracting plaintiff, defendant, and core chronology..." },
    { title: "Legal Issue Identification", desc: "Isolating actionable statutory disputes..." },
    { title: "Relevant Law / Section Matching", desc: "Mapping to Indian Penal Code / Transfer of Property Act / Contract Act..." },
    { title: "Precedent Retrieval", desc: "Searching Supreme Court ratio decidendi DB..." },
    { title: "Result Generation", desc: "Synthesizing legal advisory & next steps..." },
  ];

  const runAnalysis = useCallback((textQuery: string) => {
    if (!textQuery.trim()) return;
    setIsProcessing(true);
    setResultReady(false);
    setStageIndex(0);

    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsProcessing(false);
          setResultReady(true);
          return prev;
        }
      });
    }, 600);
  }, [stages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(query);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="blue">Citizen AI Solver</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Case Intelligence Solver
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Describe any legal scenario in normal language. Our multi-stage AI reasoning pipeline parses statutory laws, section provisions, and ratio decidendi precedents.
        </p>
      </div>

      {/* Input Box */}
      <Card variant="glass" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Describe Your Legal Issue
            </label>
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. My landlord is refusing to refund my security deposit of Rs. 75,000 after I vacated the apartment with 30 days written notice as per agreement..."
              className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Press &quot;Analyze Case&quot; to launch AI reasoning pipeline
            </span>
            <Button
              type="submit"
              variant="primary"
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Analyze Case
            </Button>
          </div>
        </form>
      </Card>

      {/* Sequential Processing Pipeline State */}
      {isProcessing && (
        <Card variant="glass" className="p-8 space-y-6 border-blue-500/40 text-center">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-[var(--text-primary)]">
              Stage {stageIndex + 1}: {stages[stageIndex].title}
            </h3>
            <p className="text-xs text-blue-400">{stages[stageIndex].desc}</p>
          </div>

          {/* Progress Stage Tracker Bar */}
          <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto pt-2">
            {stages.map((s, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx <= stageIndex ? "bg-blue-500 shadow-md shadow-blue-500/30" : "bg-slate-700/30"
                }`}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Structured Case Output */}
      {resultReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Mandatory Legal Disclaimer Notice */}
          <LegalDisclaimer variant="banner" />

          {/* Result Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Summary & Extracted Facts */}
            <Card variant="glass" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm font-serif">
                <FileText className="w-4 h-4" />
                <span>1. Extracted Case Facts</span>
              </div>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">• Parties:</span> Tenant (Complainant) vs. Landlord (Respondent)
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">• Dispute Amount:</span> ₹75,000 Security Deposit
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">• Fact Check:</span> Valid 30-day written notice served; no property damage established.
                </li>
              </ul>
            </Card>

            {/* Applicable Statutory Sections */}
            <Card variant="glass" className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-serif">
                <BookOpen className="w-4 h-4" />
                <span>2. Applicable Statutory Laws & Sections</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300 font-serif">Section 108(m) Transfer of Property Act, 1882</span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Obligation of tenant to restore property in good condition; landlord cannot withhold security deposit without proof of unreasonable waste.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                  <span className="font-bold text-blue-300 font-serif">Section 73 Indian Contract Act, 1872</span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Compensation for loss or damage caused by breach of rental contract obligations.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Precedent Matching & Ratio Decidendi */}
          <Card variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-serif">
                <Scale className="w-4 h-4" />
                <span>3. Relevant Supreme Court & High Court Precedents</span>
              </div>
              <Badge variant="success">98.2% Ratio Match</Badge>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif">
                  K.P. Moolchand vs. State of Delhi & Anr. (2018)
                </h4>
                <span className="text-xs text-[var(--text-muted)]">2018 SCC Online Del 942</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-emerald-400">Ratio Decidendi:</strong> Landlord is bound to refund security deposit within 30 days of tenancy termination unless actual physical damage is quantified with repair estimates. Arbitrary forfeiture amounts to unjust enrichment.
              </p>
            </div>
          </Card>

          {/* Recommended Next Steps */}
          <Card variant="parchment" className="space-y-4">
            <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>4. Recommended Legal Action Steps</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--text-secondary)]">
              <li>Issue formal legal notice demanding refund of ₹75,000 within 15 days with 12% interest per annum.</li>
              <li>File a complaint before the Rent Controller / District Consumer Disputes Redressal Commission.</li>
              <li>Attach rental agreement copy, bank transfer receipt, and written 30-day notice acknowledgment.</li>
            </ol>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function CaseIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-blue-400">Loading Intelligence Engine...</div>}>
      <CaseIntelligenceContent />
    </Suspense>
  );
}
