import Link from "next/link";
import type { Case } from "@/types/case";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { statusToBadgeVariant } from "@/lib/case-status";

export function ActiveCaseCard({ caseItem }: { caseItem: Case }) {
  return (
    <div className="p-5 rounded-2xl glass-card flex items-center justify-between gap-4 hover:border-[var(--accent-gold)]/40 transition-colors">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusToBadgeVariant(caseItem.status)} size="sm">{caseItem.status.replace("_", " ")}</Badge>
          <span className="text-[11px] text-[var(--accent-gold)] font-medium truncate">{caseItem.court}</span>
        </div>
        <h4 className="text-sm font-bold text-[var(--text-primary)] font-serif truncate">{caseItem.title}</h4>
        <p className="text-[11px] text-[var(--text-secondary)] truncate">{caseItem.statutoryActs}</p>
      </div>
      <Link href={`/lawyer/cases/${caseItem.id}`} className="shrink-0">
        <Button variant="outline" size="sm" className="text-xs">Deep Insights</Button>
      </Link>
    </div>
  );
}
