import type { LegalCase, TimelineEvent } from "@/types/case";

// Demo Data — for interface development only, not real case records.
export const MOCK_CASES: LegalCase[] = [
  {
    id: "case-001",
    title: "Boundary dispute — Sharma residence",
    clientName: "R. Sharma",
    status: "active",
    legalIssue: "Alleged encroachment on shared boundary wall",
    nextHearingDate: "2026-09-02",
    lastUpdated: "2026-08-10",
  },
  {
    id: "case-002",
    title: "Rent non-payment notice",
    clientName: "A. Verma",
    status: "upcoming_hearing",
    legalIssue: "Recovery of unpaid rent under tenancy agreement",
    nextHearingDate: "2026-08-25",
    lastUpdated: "2026-08-05",
  },
  {
    id: "case-003",
    title: "Employment termination review",
    clientName: "S. Nair",
    status: "pending",
    legalIssue: "Wrongful termination claim",
    lastUpdated: "2026-07-28",
  },
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  { id: "t1", title: "Case Filed", description: "Petition filed with the district court.", date: "2026-06-12", status: "completed" },
  { id: "t2", title: "Notice Issued", description: "Notice served to the opposing party.", date: "2026-06-20", status: "completed" },
  { id: "t3", title: "Reply Received", description: "Opposing party filed their response.", date: "2026-07-08", status: "completed" },
  { id: "t4", title: "First Hearing", description: "Preliminary hearing before the judge.", date: "2026-07-30", status: "completed" },
  { id: "t5", title: "Order", description: "Awaiting the court's order.", date: "2026-08-25", status: "upcoming" },
  { id: "t6", title: "Next Hearing", description: "Follow-up hearing, if required.", date: "2026-09-15", status: "pending" },
];
