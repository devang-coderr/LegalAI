import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { LawyerCard } from "@/components/legal/LawyerCard";
import { MOCK_LAWYERS } from "@/mocks/lawyers";

export default function CitizenLawyersPage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader
        title="Find a Lawyer"
        description="Lawyers matched to your case's practice area and location."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_LAWYERS.map((lawyer) => (
          <LawyerCard key={lawyer.id} lawyer={lawyer} />
        ))}
      </div>
    </DashboardShell>
  );
}
