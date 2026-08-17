export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-[var(--ink-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
