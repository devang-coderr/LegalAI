"use client";

import { Bell, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, type SessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SessionHeader({ role }: { role: "CITIZEN" | "LAWYER" }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only session after hydration
    setUser(getSession());
  }, []);
  const isLawyer = role === "LAWYER";
  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]/85 backdrop-blur-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold uppercase tracking-[.16em] ${isLawyer ? "text-[var(--accent-violet)]" : "text-[var(--accent-blue)]"}`}>
          {isLawyer ? "Lawyer Professional Workspace" : "Citizen Portal"}
        </span>
        {isLawyer && user?.verificationStatus === "VERIFIED" && <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">✓ Verified Lawyer</span>}
      </div>
      <div className="relative flex items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => setOpen(v => !v)} className="md:hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] p-2 text-[var(--text-secondary)]" aria-label="Open workspace menu">{open ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}</button>
        {open && <MobileMenu role={role} pathname={pathname} close={() => setOpen(false)} />}
        <Link href={isLawyer ? "/lawyer/notifications" : "/citizen/notifications"} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Bell className="h-4 w-4" />
        </Link>
        <ThemeToggle />
        <Link href={isLawyer ? "/lawyer/settings" : "/citizen/settings"} className="flex items-center gap-2 border-l border-[var(--border-color)] pl-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isLawyer ? "bg-purple-500/15 text-purple-300" : "bg-blue-500/15 text-blue-300"}`}>
            {user?.initials || <span className="h-3 w-3 rounded-full bg-current opacity-30 animate-pulse" aria-hidden="true" />}
          </div>
          {user?.name ? (
            <span className="hidden sm:inline text-xs font-semibold text-[var(--text-primary)]">{user.name}</span>
          ) : (
            <span className="hidden sm:inline h-3 w-20 rounded-full bg-[var(--border-color)] animate-pulse" aria-hidden="true" />
          )}
        </Link>
      </div>
    </header>
  );
}


function MobileMenu({ role, pathname, close }: { role: "CITIZEN" | "LAWYER"; pathname: string; close: () => void }) {
  const items = role === "LAWYER" ? [
    ["Dashboard", "/lawyer"],
    ["My Cases", "/lawyer/cases"],
    ["Clients", "/lawyer/clients"],
    ["Case Intelligence", "/lawyer/case-intelligence"],
    ["Legal Research", "/lawyer/legal-research"],
    ["Hearings", "/lawyer/hearings"],
    ["Documents", "/lawyer/documents"],
    ["Notifications", "/lawyer/notifications"],
    ["Settings", "/lawyer/settings"]
  ] : [
    ["Dashboard", "/citizen"],
    ["My Cases", "/citizen/cases"],
    ["Case Intelligence", "/citizen/case-intelligence"],
    ["Documents", "/citizen/documents"],
    ["Find a Lawyer", "/citizen/lawyers"],
    ["Timeline", "/citizen/timeline"],
    ["Notifications", "/citizen/notifications"],
    ["Settings", "/citizen/settings"]
  ];
  return <div className="absolute left-0 top-12 z-50 w-72 max-h-[75vh] overflow-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-2xl backdrop-blur-xl">{items.map(([label,href])=><Link key={href} href={href} onClick={close} className={`block rounded-xl px-3 py-2.5 text-xs ${pathname===href?'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]':'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>{label}</Link>)}</div>;
}
