"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, FileCheck, ShieldCheck, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSession, updateSession, type SessionUser } from "@/lib/auth";

export default function LawyerVerificationPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [docs, setDocs] = useState<{governmentId:string;enrollmentCertificate:string}|null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only session/localStorage after hydration, see citizen/page.tsx
    setUser(getSession()); try { const raw=localStorage.getItem("legalai-verification-documents"); if(raw) setDocs(JSON.parse(raw)); } catch {} }, []);

  const simulateVerification = () => {
    const next = updateSession({ verificationStatus: "VERIFIED" });
    setUser(next);
  };

  const status = user?.verificationStatus || "PENDING";
  return <div className="space-y-8 py-4">
    <div className="space-y-2"><Badge variant={status === "VERIFIED" ? "success" : "warning"}>{status === "VERIFIED" ? "Identity verified" : "Verification required"}</Badge><h1 className="font-serif text-4xl font-bold">Lawyer verification</h1><p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">LegalAI separates professional access from ordinary registration. In this frontend-only prototype, documents are collected for review and the final decision is represented by the verification workflow.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <Card variant="glass" className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"><ShieldCheck className="h-5 w-5 text-emerald-400"/><p className="mt-3 text-xs font-bold">Identity</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Government ID review</p></div><div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"><FileCheck className="h-5 w-5 text-amber-400"/><p className="mt-3 text-xs font-bold">Enrollment</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Bar Council credentials</p></div><div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"><Clock3 className="h-5 w-5 text-blue-400"/><p className="mt-3 text-xs font-bold">Review</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Admin / authorized source</p></div></div>
        <div className="space-y-4"><h2 className="font-serif text-xl font-bold">Submitted professional profile</h2><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Name</p><p className="mt-1 text-sm font-semibold">{user?.name || "—"}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Email</p><p className="mt-1 text-sm font-semibold">{user?.email || "—"}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Bar Council</p><p className="mt-1 text-sm font-semibold">{user?.barCouncil || "Not supplied"}</p></div><div className="rounded-xl bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Enrollment No.</p><p className="mt-1 text-sm font-semibold">{user?.barNumber || "Not supplied"}</p></div></div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Government ID</p><p className="mt-2 text-xs font-semibold">{docs?.governmentId || "Not uploaded"}</p></div><div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"><p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Enrollment certificate</p><p className="mt-2 text-xs font-semibold">{docs?.enrollmentCertificate || "Not uploaded"}</p></div></div>
        {status !== "VERIFIED" && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><div className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-amber-300"/><div><h3 className="text-sm font-bold">Verification pending</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Professional routes remain locked until verification is completed. For a live deployment, this step should call an authorized Bar Council/KYC verification service or an internal compliance reviewer.</p></div></div></div>}
        {status === "VERIFIED" && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"><div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400"/><div><h3 className="text-sm font-bold text-emerald-300">Verified lawyer account</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">The professional workspace is now unlocked in this prototype.</p></div></div></div>}
      </Card>
      <Card variant="glass" className="h-fit space-y-5 p-6"><h2 className="font-serif text-xl font-bold">Verification actions</h2><p className="text-xs leading-5 text-[var(--text-secondary)]">Frontend demo controls let your SIH team demonstrate both sides of the workflow without claiming that a real-world licence was verified.</p><div className="space-y-3"><div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3"><Upload className="h-4 w-4 text-[var(--accent-gold)]"/><span className="text-xs">Documents submitted at signup</span></div><div className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3"><FileCheck className="h-4 w-4 text-[var(--accent-gold)]"/><span className="text-xs">Enrollment number captured</span></div></div>{status !== "VERIFIED" ? <Button onClick={simulateVerification} className="w-full">Simulate admin verification</Button> : <Link href="/lawyer" className="block"><Button className="w-full">Enter Lawyer Workspace</Button></Link>}<Link href="/lawyer/settings" className="block text-center text-xs text-[var(--accent-gold)]">Open verification settings</Link></Card>
    </div>
  </div>;
}
