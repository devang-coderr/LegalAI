import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Timeline } from "@/components/timeline/Timeline";
import { MOCK_TIMELINE } from "@/mocks/cases";

export default function CitizenTimelinePage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader title="Timeline" description="How your case has progressed so far." />
      <Card glow={false} className="max-w-2xl">
        <Timeline events={MOCK_TIMELINE} />
      </Card>
    </DashboardShell>
  );
}
