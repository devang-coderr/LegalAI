"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, FileText, Bell, Calendar } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { AnalysisStages } from "@/components/ai/AnalysisStages";
import { CaseIntelligenceView } from "@/components/legal/CaseIntelligenceView";

type FlowState = "idle" | "analyzing" | "result";

export default function CitizenDashboard() {
  const [problem, setProblem] = useState("");
  const [flow, setFlow] = useState<FlowState>("idle");

  return (
    <DashboardShell role="citizen">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          What can we help you understand today?
        </p>

        <Card className="mt-6" glow={false}>
          <AnimatePresence mode="wait">
            {flow === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <label className="text-sm font-medium text-[var(--ink)]">
                  Describe your legal problem
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Tell us what happened… e.g. “I have a property dispute with my neighbour.”"
                  rows={4}
                  className="mt-3 w-full resize-none rounded-xl border border-[var(--surface-border)] bg-[var(--surface)]/60 p-4 text-sm text-[var(--ink)] outline-none transition-all duration-300 placeholder:text-[var(--ink-faint)] focus:border-[var(--azure)]/60 focus:shadow-[var(--shadow-glow-azure)]"
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    showArrow
                    disabled={!problem.trim()}
                    onClick={() => setFlow("analyzing")}
                  >
                    Analyze my case
                  </Button>
                </div>
              </motion.div>
            )}

            {flow === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <p className="mb-6 text-center text-sm text-[var(--ink-muted)]">
                  Analyzing your case…
                </p>
                <AnalysisStages onComplete={() => setFlow("result")} />
              </motion.div>
            )}

            {flow === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CaseIntelligenceView caseTitle="Case Intelligence" />

                <div className="mt-5 flex justify-end">
                  <Button variant="ghost" onClick={() => { setFlow("idle"); setProblem(""); }}>
                    Start a new case
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Recent Cases</h3>
            <EmptyState icon={FolderOpen} title="No cases yet" description="Cases you analyze will show up here." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Upcoming Hearings</h3>
            <EmptyState icon={Calendar} title="Nothing scheduled" description="Hearing dates linked to your cases will appear here." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Recent Documents</h3>
            <EmptyState icon={FileText} title="No documents uploaded" description="Upload a notice or agreement to get started." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Notifications</h3>
            <EmptyState icon={Bell} title="You're all caught up" description="We'll notify you about case and document updates." />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
