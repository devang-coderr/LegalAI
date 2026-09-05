"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLawyerClients } from "@/hooks/useLawyerClients";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { getSession } from "@/lib/auth";
import type { Case } from "@/types/case";

const CASE_TYPES = ["Civil", "Criminal", "Family", "Property", "Corporate", "Consumer", "Employment", "Other"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

interface FormState {
  name: string; email: string; phone: string; address: string;
  matterTitle: string; caseType: string; description: string;
  priority: (typeof PRIORITIES)[number]; court: string; caseNumber: string; nextHearing: string;
}

const INITIAL: FormState = {
  name: "", email: "", phone: "", address: "",
  matterTitle: "", caseType: "Civil", description: "",
  priority: "MEDIUM", court: "", caseNumber: "", nextHearing: "",
};

export default function AddClientPage() {
  const router = useRouter();
  const { addClient } = useLawyerClients();
  const { addCase } = useLawyerCases();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.matterTitle.trim()) next.matterTitle = "Matter / case title is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);

    const clientResponse = await addClient({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
    });

    if (!clientResponse.success) {
      setSaving(false);
      setSubmitError(clientResponse.error?.message || "Unable to save this client. Please try again.");
      return;
    }

    const newCase: Omit<Case, "id"> = {
      title: form.matterTitle.trim(),
      caseNumber: form.caseNumber.trim() || undefined,
      court: form.court.trim() || "Not yet assigned",
      clientId: clientResponse.data.id,
      clientName: clientResponse.data.name,
      caseType: form.caseType,
      priority: form.priority,
      assignedLawyer: getSession()?.name,
      description: form.description.trim() || undefined,
      status: form.nextHearing ? "UPCOMING_HEARING" : "PENDING",
      statutoryActs: "To be determined",
      nextHearingDate: form.nextHearing || undefined,
    };
    await addCase(newCase);

    setSaving(false);
    router.push(`/lawyer/clients/${clientResponse.data.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-serif">Add Client</h1>
        <p className="text-xs text-[var(--text-secondary)]">Create a client record and their first matter together.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm font-serif">
            <UserRound className="w-4 h-4" /> Client Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" error={errors.name}>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className="lp-input" placeholder="Aarav Mehta" />
            </Field>
            <Field label="Phone *" error={errors.phone}>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="lp-input" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" className="lp-input" placeholder="client@example.com" />
            </Field>
            <Field label="Address">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className="lp-input" placeholder="City, State" />
            </Field>
          </div>
        </Card>

        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm font-serif">
            <UserRound className="w-4 h-4" /> Matter Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Matter / Case Title *" error={errors.matterTitle} full>
              <input value={form.matterTitle} onChange={(e) => set("matterTitle", e.target.value)} className="lp-input" placeholder="Property inheritance dispute" />
            </Field>
            <Field label="Case Type">
              <select value={form.caseType} onChange={(e) => set("caseType", e.target.value)} className="lp-input">
                {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value as FormState["priority"])} className="lp-input">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Court">
              <input value={form.court} onChange={(e) => set("court", e.target.value)} className="lp-input" placeholder="District Court, Mumbai" />
            </Field>
            <Field label="Case Number">
              <input value={form.caseNumber} onChange={(e) => set("caseNumber", e.target.value)} className="lp-input" placeholder="CIV/1234/2026" />
            </Field>
            <Field label="Next Hearing">
              <input type="date" value={form.nextHearing} onChange={(e) => set("nextHearing", e.target.value)} className="lp-input" />
            </Field>
            <Field label="Short Description" full>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="lp-input resize-none" placeholder="Brief summary of the matter…" />
            </Field>
          </div>
        </Card>

        {submitError && <p className="text-xs text-rose-400">{submitError}</p>}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/lawyer/clients")}>Cancel</Button>
          <Button type="submit" variant="gold" isLoading={saving} rightIcon={<ArrowRight className="w-4 h-4" />}>Save Client</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, full, children }: { label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      {children}
      {error && <span className="block text-[11px] text-rose-400">{error}</span>}
    </label>
  );
}
