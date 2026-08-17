import type { AppNotification, Hearing, Client } from "@/types/document";

// Demo Data — for interface development only.

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "hearing",
    title: "Upcoming hearing tomorrow",
    description: "Sharma residence boundary dispute — 10:30 AM, District Court.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    type: "document",
    title: "Document analysis complete",
    description: "Your uploaded tenancy agreement has been analyzed.",
    time: "1d ago",
    read: false,
  },
  {
    id: "n3",
    type: "research",
    title: "Research saved",
    description: "Your query on boundary encroachment precedents was saved.",
    time: "3d ago",
    read: true,
  },
];

export const MOCK_HEARINGS: Hearing[] = [
  {
    id: "h1",
    caseTitle: "Boundary dispute — Sharma residence",
    clientName: "R. Sharma",
    court: "District Court, Sector 12",
    date: "2026-09-02",
    time: "10:30 AM",
    status: "scheduled",
    notes: "Bring survey report and prior correspondence.",
  },
  {
    id: "h2",
    caseTitle: "Rent non-payment notice",
    clientName: "A. Verma",
    court: "Rent Control Tribunal",
    date: "2026-08-25",
    time: "2:00 PM",
    status: "scheduled",
  },
];

export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "R. Sharma", activeCases: 1, lastContact: "2026-08-10", email: "r.sharma@example.com" },
  { id: "c2", name: "A. Verma", activeCases: 1, lastContact: "2026-08-05", email: "a.verma@example.com" },
  { id: "c3", name: "S. Nair", activeCases: 1, lastContact: "2026-07-28", email: "s.nair@example.com" },
];
