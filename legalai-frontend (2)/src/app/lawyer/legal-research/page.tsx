import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { LegalResearchPanel } from "@/components/legal/LegalResearchPanel";

export default function LawyerLegalResearchPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader
        title="Legal Research"
        description="Ask about precedents, exceptions, or judgments relevant to a case."
      />
      <LegalResearchPanel />
    </DashboardShell>
  );
}
