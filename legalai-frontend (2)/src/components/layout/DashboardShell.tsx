"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { CITIZEN_NAV, LAWYER_NAV } from "@/lib/constants";

export function DashboardShell({
  role,
  children,
}: {
  role: "citizen" | "lawyer";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "citizen" ? CITIZEN_NAV : LAWYER_NAV;
  const roleLabel = role === "citizen" ? "Citizen" : "Lawyer";

  const sidebarContent = (
    <>
      <Link href="/" className="flex items-center gap-2 px-2 py-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--azure-soft)] text-[var(--azure)]">
          <Scale className="h-4 w-4" />
        </span>
        <span className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          LegalAI
        </span>
      </Link>

      <p className="mt-6 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">
        {roleLabel} workspace
      </p>

      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                active
                  ? "bg-[var(--azure-soft)] text-[var(--azure)]"
                  : "text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--void)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[var(--surface-border)] bg-[var(--surface)]/40 p-4 backdrop-blur-sm lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[var(--surface-border)] bg-[var(--void)] p-4">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--void)]/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-[var(--ink-muted)] hover:bg-[var(--surface)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>

      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed right-4 top-4 z-50 rounded-full bg-[var(--surface-2)] p-2 text-[var(--ink)] lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
