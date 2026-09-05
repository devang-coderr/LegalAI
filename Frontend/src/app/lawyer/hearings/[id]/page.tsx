"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  NotebookPen,
  UserRound,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useHearings } from "@/hooks/useHearings";
import { useLawyerDocuments } from "@/hooks/useLawyerDocuments";
import type { HearingStatus } from "@/types/lawyer";

const STATUS_VARIANT: Record<HearingStatus, "success" | "warning" | "danger" | "blue"> = {
  SCHEDULED: "blue", COMPLETED: "success", ADJOURNED: "warning", CANCELLED: "danger",
};

export default function HearingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hearingId = String(params?.id || "");
  const { hearings, hearingsForCase, isLoading, patchHearing } = useHearings();
  const { documentsForCase } = useLawyerDocuments();

  const hearing = hearings.find((h) => h.id === hearingId);
  const [outcome, setOutcome] = useState(hearing?.outcome || "");
  const [savingStatus, setSavingStatus] = useState<HearingStatus | null>(null);

  if (isLoading) return <CardSkeleton />;

  if (!hearing) {
    return (
      <EmptyState
        title="Hearing not found"
        description="This hearing may have been removed, or the link is out of date."
        actionLabel="Back to Hearings"
        onAction={() => router.push("/lawyer/hearings")}
        className="p-16"
      />
    );
  }

  const history = hearingsForCase(hearing.caseId).filter((h) => h.id !== hearing.id);
  const relatedDocs = documentsForCase(hearing.caseId);

  const setStatus = async (status: HearingStatus) => {
    setSavingStatus(status);
    await patchHearing(hearing.id, { status, outcome: status === "COMPLETED" ? outcome || hearing.outcome : hearing.outcome });
    setSavingStatus(null);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8 max-w-3xl mx-auto">
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant={STATUS_VARIANT[hearing.status]}>{hearing.status}</Badge>
            <h1 className="mt-2 text-2xl font-bold font-serif">{hearing.caseTitle}</h1>
            <p className="text-xs text-[var(--text-secondary)]">{hearing.hearingType}</p>
          </div>
          <Link href={`/lawyer/cases/${hearing.caseId}`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Open Case</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Info icon={UserRound} label="Client" value={hearing.clientName} />
          <Info icon={Building2} label="Court" value={hearing.court} />
          <Info icon={Calendar} label="Date" value={hearing.date} />
          <Info icon={Clock} label="Time" value={hearing.time} />
        </div>
      </Card>

      {hearing.prepNotes && (
        <Card variant="glass" className="p-5 space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm font-serif"><NotebookPen className="w-4 h-4" />Preparation Notes</div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{hearing.prepNotes}</p>
        </Card>
      )}

      <Card variant="glass" className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif"><FileText className="w-4 h-4 text-[var(--accent-gold)]" />Relevant Documents</div>
        {relatedDocs.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">No documents linked to this case yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {relatedDocs.map((d) => (
              <li key={d.id}>
                <a href={d.objectUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)]">{d.fileName}</a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card variant="glass" className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif"><Gavel className="w-4 h-4 text-[var(--accent-gold)]" />Outcome</div>
        <textarea
          rows={3}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Record what happened at this hearing…"
          className="lp-input resize-none"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="gold" size="sm" isLoading={savingStatus === "COMPLETED"} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => setStatus("COMPLETED")}>Mark Completed</Button>
          <Button variant="outline" size="sm" isLoading={savingStatus === "ADJOURNED"} onClick={() => setStatus("ADJOURNED")}>Mark Adjourned</Button>
          <Button variant="outline" size="sm" isLoading={savingStatus === "CANCELLED"} leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setStatus("CANCELLED")}>Mark Cancelled</Button>
        </div>
        <Link href={`/lawyer/hearings?caseId=${hearing.caseId}`}>
          <Button variant="ghost" size="sm" className="mt-1">+ Schedule next hearing for this case</Button>
        </Link>
      </Card>

      <Card variant="glass" className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif">Previous Hearings for This Case</div>
        {history.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">This is the first recorded hearing for this case.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <Link key={h.id} href={`/lawyer/hearings/${h.id}`} className="flex items-center justify-between rounded-lg border border-[var(--border-color)] px-3 py-2 hover:border-[var(--accent-gold)]/40">
                <span className="text-xs">{h.date} · {h.hearingType}</span>
                <Badge variant={STATUS_VARIANT[h.status]} size="sm">{h.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] p-3">
      <Icon className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
      <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">{label}</p>
      <p className="text-xs font-semibold truncate">{value}</p>
    </div>
  );
}
