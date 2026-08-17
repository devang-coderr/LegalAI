import Link from "next/link";
import { Scale } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--void)] px-6 py-24">
      <div
        aria-hidden="true"
        className="signature-beam pointer-events-none absolute left-1/2 top-0 h-full w-[480px] -translate-x-1/2 opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-end justify-between opacity-[0.05]"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[70%] w-[3%] bg-gradient-to-t from-[var(--ink)] to-transparent" />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--azure-soft)] text-[var(--azure)]">
            <Scale className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
            LegalAI
          </span>
        </Link>

        <div className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-2)]/70 p-8 shadow-[var(--shadow-elevated)] backdrop-blur-sm">
          <p className="text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--azure)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm text-[var(--ink-muted)]">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">{footer}</p>
      </div>
    </main>
  );
}
