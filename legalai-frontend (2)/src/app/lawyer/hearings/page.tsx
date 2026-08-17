import { Calendar } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { HearingCard } from "@/components/legal/HearingCard";
import { EmptyState } from "@/components/common/EmptyState";
import { MOCK_HEARINGS } from "@/mocks/documents";

export default function LawyerHearingsPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Hearings" description="Upcoming hearings across your active cases." />
      {MOCK_HEARINGS.length === 0 ? (
        <EmptyState icon={Calendar} title="Nothing scheduled" description="Hearing dates from your cases will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_HEARINGS.map((h) => (
            <HearingCard key={h.id} hearing={h} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
