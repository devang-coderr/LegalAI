import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  FileText,
  Users,
  Clock,
  Bell,
  Settings,
  Scale,
  Gavel,
  Calendar,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const CITIZEN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/citizen", icon: LayoutDashboard },
  { label: "My Cases", href: "/citizen/cases", icon: FolderOpen },
  { label: "Case Intelligence", href: "/citizen/case-intelligence", icon: Scale },
  { label: "Legal Research", href: "/citizen/legal-research", icon: Search },
  { label: "Documents", href: "/citizen/documents", icon: FileText },
  { label: "Find a Lawyer", href: "/citizen/lawyers", icon: Users },
  { label: "Timeline", href: "/citizen/timeline", icon: Clock },
  { label: "Notifications", href: "/citizen/notifications", icon: Bell },
  { label: "Settings", href: "/citizen/settings", icon: Settings },
];

export const LAWYER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/lawyer", icon: LayoutDashboard },
  { label: "My Cases", href: "/lawyer/cases", icon: FolderOpen },
  { label: "Clients", href: "/lawyer/clients", icon: Users },
  { label: "Case Intelligence", href: "/lawyer/case-intelligence", icon: Scale },
  { label: "Legal Research", href: "/lawyer/legal-research", icon: Search },
  { label: "Precedents", href: "/lawyer/precedents", icon: Gavel },
  { label: "Hearings", href: "/lawyer/hearings", icon: Calendar },
  { label: "Documents", href: "/lawyer/documents", icon: FileText },
  { label: "Notifications", href: "/lawyer/notifications", icon: Bell },
  { label: "Settings", href: "/lawyer/settings", icon: Settings },
];
