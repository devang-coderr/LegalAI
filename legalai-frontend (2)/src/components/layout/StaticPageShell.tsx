import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export function StaticPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-[var(--void)] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--azure-soft)] text-[var(--azure)]">
            <Scale className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">LegalAI</span>
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--ink-muted)]">
          {children}
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-1.5 text-sm text-[var(--azure)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </main>
  );
}
