import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/types/case";

const STATUS_STYLES: Record<CaseStatus, string> = {
  active: "bg-[var(--azure-soft)] text-[var(--azure)]",
  pending: "bg-[var(--gold-soft)] text-[var(--gold)]",
  closed: "bg-[var(--surface)] text-[var(--ink-faint)]",
  upcoming_hearing: "bg-emerald-500/10 text-emerald-400",
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  active: "Active",
  pending: "Pending",
  closed: "Closed",
  upcoming_hearing: "Upcoming Hearing",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
