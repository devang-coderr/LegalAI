import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/common/NotificationList";
import { MOCK_NOTIFICATIONS } from "@/mocks/documents";

export default function CitizenNotificationsPage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader title="Notifications" description="Updates on your cases, documents, and hearings." />
      <div className="max-w-2xl">
        <NotificationList notifications={MOCK_NOTIFICATIONS} />
      </div>
    </DashboardShell>
  );
}
