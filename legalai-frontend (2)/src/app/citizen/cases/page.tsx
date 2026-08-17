"use client";

import { FolderOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { CaseCard } from "@/components/legal/CaseCard";
import { MOCK_CASES } from "@/mocks/cases";

export default function CitizenCasesPage() {
  return (
    <DashboardShell role="citizen">
      <PageHeader title="My Cases" description="Every case you've asked LegalAI to analyze." />
      {MOCK_CASES.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No cases yet" description="Analyze a legal problem from your dashboard to see it here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_CASES.map((c) => (
            <CaseCard key={c.id} legalCase={c} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
