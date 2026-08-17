import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { ClientCard } from "@/components/legal/ClientCard";
import { MOCK_CLIENTS } from "@/mocks/documents";

export default function LawyerClientsPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Clients" description="Everyone you're currently representing." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CLIENTS.map((c) => (
          <ClientCard key={c.id} client={c} />
        ))}
      </div>
    </DashboardShell>
  );
}
