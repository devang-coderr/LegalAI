import { Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Client } from "@/types/document";

export function ClientCard({ client }: { client: Client }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--azure-soft)] font-[family-name:var(--font-display)] text-[var(--azure)]">
          {client.name[0]}
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">
            {client.name}
          </h3>
          <p className="text-xs text-[var(--ink-faint)]">
            {client.activeCases} active case{client.activeCases !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-[var(--ink-muted)]">
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {client.email}
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Last contact {client.lastContact}
        </p>
      </div>
    </Card>
  );
}
