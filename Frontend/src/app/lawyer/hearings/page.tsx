"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, CalendarClock, CalendarDays, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useHearings } from "@/hooks/useHearings";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { HEARING_TYPES, type HearingReminder } from "@/types/lawyer";

const HEARING_STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "blue" | "neutral"> = {
  SCHEDULED: "blue",
  COMPLETED: "success",
  ADJOURNED: "warning",
  CANCELLED: "danger",
};

const REMINDER_LABEL: Record<HearingReminder, string> = {
  NONE: "None",
  "1_DAY": "1 day before",
  "3_DAYS": "3 days before",
  "1_WEEK": "1 week before",
};

export default function LawyerHearingsPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <LawyerHearingsContent />
    </Suspense>
  );
}

function LawyerHearingsContent() {
  const searchParams = useSearchParams();
  const prefillCaseId = searchParams.get("caseId");
  const { upcoming, past, isLoading, addHearing } = useHearings();
  const { cases } = useLawyerCases();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [modalOpen, setModalOpen] = useState(false);

  const [caseId, setCaseId] = useState("");
  const [court, setCourt] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hearingType, setHearingType] = useState<string>(HEARING_TYPES[0]);
  const [prepNotes, setPrepNotes] = useState("");
  const [reminder, setReminder] = useState<HearingReminder>("1_DAY");
  const [saving, setSaving] = useState(false);

  const selectedCase = cases.find((c) => c.id === caseId);

  useEffect(() => {
    if (prefillCaseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a URL param present only after hydration
      setCaseId(prefillCaseId);
      setModalOpen(true);
    }
  }, [prefillCaseId]);

  const resetForm = () => {
    setCaseId(""); setCourt(""); setDate(""); setTime("");
    setHearingType(HEARING_TYPES[0]); setPrepNotes(""); setReminder("1_DAY");
  };

  const handleSave = async () => {
    if (!selectedCase || !court.trim() || !date || !time) return;
    setSaving(true);
    await addHearing({
      caseId: selectedCase.id,
      caseTitle: selectedCase.title,
      clientId: selectedCase.clientId || "",
      clientName: selectedCase.clientName,
      court: court.trim(),
      date,
      time,
      hearingType,
      status: "SCHEDULED",
      prepNotes: prepNotes.trim() || undefined,
      reminder,
    });
    setSaving(false);
    setModalOpen(false);
    resetForm();
  };

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif">Hearings</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Schedule and track hearings across all your matters.</p>
        </div>
        <Button variant="gold" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)} disabled={cases.length === 0}>
          Schedule Hearing
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "upcoming", label: "Upcoming", count: upcoming.length },
          { id: "past", label: "Past", count: past.length },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      {isLoading ? (
        <CardSkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          icon={tab === "upcoming" ? <CalendarClock className="w-8 h-8" /> : <CalendarDays className="w-8 h-8" />}
          title={tab === "upcoming" ? "No upcoming hearings" : "No past hearings"}
          description={cases.length === 0 ? "Add a client and case first, then schedule a hearing for it." : "Scheduled hearings for your cases will appear here."}
          actionLabel={cases.length > 0 ? "Schedule Hearing" : undefined}
          onAction={cases.length > 0 ? () => setModalOpen(true) : undefined}
          className="p-16"
        />
      ) : (
        <div className="space-y-3">
          {list.map((h) => (
            <Link key={h.id} href={`/lawyer/hearings/${h.id}`}>
              <Card variant="glass" className="p-5 hover:border-[var(--accent-gold)]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={HEARING_STATUS_VARIANT[h.status]} size="sm">{h.status}</Badge>
                      <span className="text-[11px] text-[var(--accent-gold)] font-medium">{h.hearingType}</span>
                    </div>
                    <h3 className="text-sm font-bold font-serif mt-1">{h.caseTitle}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{h.clientName} · {h.court}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold flex items-center gap-1.5 justify-end"><Calendar className="w-3.5 h-3.5 text-[var(--accent-gold)]" />{h.date}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{h.time}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Hearing">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Select Case *</span>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="lp-input">
              <option value="">Choose a case</option>
              {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          {selectedCase && (
            <div className="rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              Client: <span className="text-[var(--text-primary)] font-medium">{selectedCase.clientName}</span>
            </div>
          )}
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Court *</span>
            <input value={court} onChange={(e) => setCourt(e.target.value)} className="lp-input" placeholder="District Court, Mumbai" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Date *</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="lp-input" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Time *</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="lp-input" />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Hearing Type</span>
            <select value={hearingType} onChange={(e) => setHearingType(e.target.value)} className="lp-input">
              {HEARING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Preparation Notes</span>
            <textarea rows={3} value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} className="lp-input resize-none" placeholder="What to prepare before this hearing…" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Reminder</span>
            <select value={reminder} onChange={(e) => setReminder(e.target.value as HearingReminder)} className="lp-input">
              {Object.entries(REMINDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" size="sm" isLoading={saving} onClick={handleSave} disabled={!caseId || !court.trim() || !date || !time}>Save Hearing</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
