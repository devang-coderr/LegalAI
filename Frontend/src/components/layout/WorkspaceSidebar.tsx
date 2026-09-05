"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";

export interface WorkspaceNavigationItem { label: string; href: string; icon: LucideIcon; }
interface WorkspaceSidebarProps { workspace: "Citizen" | "Lawyer"; homeHref: string; navigation: WorkspaceNavigationItem[]; }

export function WorkspaceSidebar({ workspace, homeHref, navigation }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => href === homeHref ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <aside className="workspace-sidebar relative z-20 hidden min-h-screen w-64 shrink-0 flex-col border-r md:flex" aria-label={`${workspace} workspace navigation`}>
      <div className="px-4 pt-6">
        <Link href="/" className="workspace-brand group" aria-label="LegalAI — go to landing page">
          <span className="workspace-brand-mark" aria-hidden="true"><Scale className="h-4 w-4" /></span>
          <span className="text-[18px] font-medium tracking-[-0.03em] text-[var(--text-primary)]">LegalAI</span>
        </Link>
      </div>
      <nav className="mt-7 flex-1 px-4" aria-label={`${workspace} features`}>
        <p className="workspace-label">{workspace} workspace</p>
        <div className="mt-2 space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("workspace-nav-item", active && "workspace-nav-item-active")}><Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.7} /><span>{label}</span></Link>;
          })}
        </div>
      </nav>
      <div className="border-t border-[var(--border-color)] p-4"><LogoutButton /></div>
    </aside>
  );
}
