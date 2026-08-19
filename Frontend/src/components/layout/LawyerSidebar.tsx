"use client";

import {
  Bell,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  Scale,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { WorkspaceSidebar, type WorkspaceNavigationItem } from "@/components/layout/WorkspaceSidebar";

const lawyerNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/lawyer", icon: LayoutDashboard },
  { label: "My Cases", href: "/lawyer/cases", icon: FolderOpen },
  { label: "Clients", href: "/lawyer/clients", icon: UsersRound },
  { label: "Case Intelligence", href: "/lawyer/case-intelligence", icon: Scale },
  { label: "Legal Research", href: "/lawyer/legal-research", icon: Search },
  { label: "Precedents", href: "/lawyer/precedents", icon: Gavel },
  { label: "Hearings", href: "/lawyer/hearings", icon: BriefcaseBusiness },
  { label: "Documents", href: "/lawyer/documents", icon: FileText },
  { label: "Notifications", href: "/lawyer/notifications", icon: Bell },
  { label: "Settings", href: "/lawyer/settings", icon: Settings },
];

export function LawyerSidebar() {
  return <WorkspaceSidebar workspace="Lawyer" homeHref="/lawyer" navigation={lawyerNavigation} />;
}
