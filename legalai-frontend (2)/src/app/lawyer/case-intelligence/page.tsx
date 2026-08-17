"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { CaseIntelligenceView } from "@/components/legal/CaseIntelligenceView";
import { MOCK_CASES } from "@/mocks/cases";
import { cn } from "@/lib/utils";

export default function LawyerCaseIntelligencePage() {
  const [selected, setSelected] = useState(MOCK_CASES[0].id);
  const activeCase = MOCK_CASES.find((c) => c.id === selected) ?? MOCK_CASES[0];

  return (
    <DashboardShell role="lawyer">
      <PageHeader
        title="Case Intelligence"
        description="Facts, legal issues, relevant law, and precedents for a selected case."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {MOCK_CASES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-300",
              selected === c.id
                ? "border-[var(--azure)] bg-[var(--azure-soft)] text-[var(--azure)]"
                : "border-[var(--surface-border)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            {c.title}
          </button>
        ))}
      </div>

      <Card glow={false}>
        <CaseIntelligenceView caseTitle={activeCase.title} />
      </Card>
    </DashboardShell>
  );
}
