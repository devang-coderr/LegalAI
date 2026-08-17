import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Hearing } from "@/types/document";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Hearing["status"], string> = {
  scheduled: "bg-[var(--azure-soft)] text-[var(--azure)]",
  completed: "bg-[var(--surface)] text-[var(--ink-faint)]",
  adjourned: "bg-[var(--gold-soft)] text-[var(--gold)]",
};

export function HearingCard({ hearing }: { hearing: Hearing }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          {hearing.caseTitle}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
            STATUS_STYLES[hearing.status]
          )}
        >
          {hearing.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--ink-faint)]">Client: {hearing.clientName}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--ink-muted)]">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {hearing.date}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {hearing.time}
        </span>
        <span className="col-span-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {hearing.court}
        </span>
      </div>

      {hearing.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--surface)]/60 p-3 text-xs text-[var(--ink-muted)]">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--azure)]" />
          {hearing.notes}
        </div>
      )}
    </Card>
  );
}
