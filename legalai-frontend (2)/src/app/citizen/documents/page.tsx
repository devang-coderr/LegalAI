import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FileUploader } from "@/components/documents/FileUploader";

export default function CitizenDocumentsPage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader
        title="Documents"
        description="Upload a notice, agreement, or judgment for LegalAI to read and summarize."
      />
      <FileUploader />
    </DashboardShell>
  );
}
