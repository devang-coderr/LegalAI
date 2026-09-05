"use client";

import {
  Bell,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Scale,
  Settings,
  UsersRound,
} from "lucide-react";
import { WorkspaceSidebar, type WorkspaceNavigationItem } from "@/components/layout/WorkspaceSidebar";

const citizenNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/citizen", icon: LayoutDashboard },
  { label: "My Cases", href: "/citizen/cases", icon: FolderOpen },
  { label: "Case Intelligence", href: "/citizen/case-intelligence", icon: Scale },
  { label: "Documents", href: "/citizen/documents", icon: FileText },
  { label: "Find a Lawyer", href: "/citizen/lawyers", icon: UsersRound },
  { label: "Timeline", href: "/citizen/timeline", icon: BriefcaseBusiness },
  { label: "Notifications", href: "/citizen/notifications", icon: Bell },
  { label: "Settings", href: "/citizen/settings", icon: Settings },
];

export function CitizenSidebar() {
  return <WorkspaceSidebar workspace="Citizen" homeHref="/citizen" navigation={citizenNavigation} />;
}
