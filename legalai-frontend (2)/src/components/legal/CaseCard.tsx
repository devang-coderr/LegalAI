import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import type { LegalCase } from "@/types/case";

export function CaseCard({ legalCase }: { legalCase: LegalCase }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            {legalCase.title}
          </h3>
          {legalCase.clientName && (
            <p className="mt-0.5 text-xs text-[var(--ink-faint)]">Client: {legalCase.clientName}</p>
          )}
        </div>
        <StatusBadge status={legalCase.status} />
      </div>

      <p className="mt-3 text-sm text-[var(--ink-muted)]">{legalCase.legalIssue}</p>

      {legalCase.nextHearingDate && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--ink-faint)]">
          <Calendar className="h-3.5 w-3.5" />
          Next hearing: {legalCase.nextHearingDate}
        </div>
      )}
    </Card>
  );
}
