import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { LegalResearchPanel } from "@/components/legal/LegalResearchPanel";

export default function CitizenLegalResearchPage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader
        title="Legal Research"
        description="Ask a question in plain language and get an answer grounded in real sources."
      />
      <LegalResearchPanel />
    </DashboardShell>
  );
}
