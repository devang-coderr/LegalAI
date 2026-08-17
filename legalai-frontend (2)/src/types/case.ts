export type CaseStatus = "active" | "pending" | "closed" | "upcoming_hearing";

export interface LegalCase {
  id: string;
  title: string;
  clientName?: string;
  status: CaseStatus;
  legalIssue: string;
  nextHearingDate?: string;
  lastUpdated: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "upcoming" | "pending";
}
