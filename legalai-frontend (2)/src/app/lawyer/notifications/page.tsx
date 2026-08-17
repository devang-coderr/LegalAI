import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/common/NotificationList";
import { MOCK_NOTIFICATIONS } from "@/mocks/documents";

export default function LawyerNotificationsPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Notifications" description="Updates on your cases, clients, and hearings." />
      <div className="max-w-2xl">
        <NotificationList notifications={MOCK_NOTIFICATIONS} />
      </div>
    </DashboardShell>
  );
}
