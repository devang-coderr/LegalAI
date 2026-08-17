import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { CaseCard } from "@/components/legal/CaseCard";
import { MOCK_CASES } from "@/mocks/cases";

export default function LawyerCasesPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="My Cases" description="Cases currently assigned to you." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CASES.map((c) => (
          <CaseCard key={c.id} legalCase={c} />
        ))}
      </div>
    </DashboardShell>
  );
}
