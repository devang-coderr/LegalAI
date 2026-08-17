import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { FileUploader } from "@/components/documents/FileUploader";

export default function LawyerDocumentsPage() {
  return (
    <DashboardShell role="lawyer">
      <PageHeader title="Documents" description="Upload case documents for OCR and AI analysis." />
      <FileUploader />
    </DashboardShell>
  );
}
