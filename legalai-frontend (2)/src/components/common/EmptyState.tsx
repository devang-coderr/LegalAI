import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--surface-border)] px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--ink-faint)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--ink)]">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-[var(--ink-muted)]">{description}</p>
    </div>
  );
}
