import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default function LawyerSettingsPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Settings" description="Manage your profile, preferences, and account." />
      <SettingsPanel role="lawyer" />
    </DashboardShell>
  );
}
