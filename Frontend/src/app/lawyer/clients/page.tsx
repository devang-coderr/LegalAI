"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, UserPlus, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useLawyerClients } from "@/hooks/useLawyerClients";
import { useLawyerCases } from "@/hooks/useLawyerCases";

export default function LawyerClientsPage() {
  const router = useRouter();
  const { clients, isLoading, error, reload } = useLawyerClients();
  const { cases } = useLawyerCases();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    [clients, q]
  );

  const casesFor = (clientId: string) => cases.filter((c) => c.clientId === clientId);

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold">Clients</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Keep client matters, contacts, documents, and upcoming work organized in one place.</p>
        </div>
        <Link href="/lawyer/clients/add">
          <Button variant="gold"><UserPlus className="mr-2 h-4 w-4" />Add Client</Button>
        </Link>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState description={error} onRetry={reload} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="w-8 h-8" />}
          title="No clients yet"
          description="Clients appear here once you add one or accept a client request from Notifications."
          actionLabel="Add Client"
          onAction={() => router.push("/lawyer/clients/add")}
          className="p-16"
        />
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients"
              className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-9 pr-4 text-xs"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const clientCases = casesFor(c.id);
              const nextHearing = clientCases.map((cc) => cc.nextHearingDate).filter(Boolean).sort()[0];
              return (
                <Link key={c.id} href={`/lawyer/clients/${c.id}`}>
                  <Card variant="glass" className="p-5 h-full hover:border-[var(--accent-gold)]/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{c.phone}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge size="sm" variant="neutral">{clientCases.length} matter{clientCases.length === 1 ? "" : "s"}</Badge>
                      <span className="text-[10px] text-[var(--text-muted)]">{nextHearing ? `Next: ${nextHearing}` : "No hearing set"}</span>
                    </div>
                  </Card>
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <Card className="p-8 text-center sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-[var(--text-secondary)]">No clients match &quot;{q}&quot;.</p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
