"use client";

import { FolderOpen, Calendar, Search, Bell } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/common/EmptyState";

export default function LawyerDashboard() {
  return (
    <DashboardShell role="lawyer">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          What needs your attention
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Your active cases, upcoming hearings, and research will appear here once connected to the backend.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Active Cases</h3>
            <EmptyState icon={FolderOpen} title="No active cases" description="Cases assigned to you will be listed here." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Upcoming Hearings</h3>
            <EmptyState icon={Calendar} title="Nothing scheduled" description="Hearing dates from your cases will appear here." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Recent Research</h3>
            <EmptyState icon={Search} title="No research yet" description="Questions you ask in Legal Research will show up here." />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Notifications</h3>
            <EmptyState icon={Bell} title="You're all caught up" description="Client and case updates will appear here." />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
