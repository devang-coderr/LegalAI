export interface RecentAnalysis {
  id: string;
  query: string;
  summary: string;
  createdAt: string; // ISO timestamp
}

export interface RecentSearch {
  id: string;
  query: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "COMPLETED" | "UPCOMING" | "PENDING";
}

export interface CitizenNotification {
  id: string;
  title: string;
  text: string;
  category: "request" | "hearing" | "case" | "document" | "system";
  createdAt: string;
  read: boolean;
}

/** Tracks a client request the citizen has sent, and its live status. */
export interface SentLawyerRequest {
  id: string;
  lawyerId: string;
  lawyerName: string;
  caseType?: string;
  summary: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  createdAt: string;
  respondedAt?: string;
}


export const CITIZEN_BUCKETS = {
  analyses: "citizen-case-analyses",
  searches: "citizen-case-searches",
  timeline: "citizen-timeline",
  documents: "citizen-documents",
  notifications: "citizen-notifications",
  sentRequests: "citizen-sent-lawyer-requests",
} as const;
