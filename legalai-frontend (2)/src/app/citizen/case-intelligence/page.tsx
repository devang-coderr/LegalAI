"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { CaseIntelligenceView } from "@/components/legal/CaseIntelligenceView";
import { MOCK_CASES } from "@/mocks/cases";

export default function CitizenCaseIntelligencePage() {
  const activeCase = MOCK_CASES[0];

  return (
    <DashboardShell role="citizen">
      <PageHeader
        title="Case Intelligence"
        description="A structured breakdown of the facts, law, and precedents behind your case."
      />
      <Card glow={false}>
        <CaseIntelligenceView caseTitle={activeCase.title} />
      </Card>
    </DashboardShell>
  );
}
