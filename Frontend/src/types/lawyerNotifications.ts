export interface ClientRequest {
  id: string;
  /** Target lawyer's session id — the bucket this record lives in. */
  lawyerId: string;
  lawyerName: string;
  /** Citizen's session id — used to write the accept/decline notification back. */
  citizenId: string;
  clientName: string;
  summary: string;
  caseType?: string;
  createdAt: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  respondedAt?: string;
}


export interface WorkspaceNotification {
  id: string;
  title: string;
  text: string;
  category: "hearing" | "case" | "document" | "system";
  createdAt: string;
  read: boolean;
}

export const LAWYER_BUCKETS = {
  clientRequests: "lawyer-client-requests",
  notifications: "lawyer-notifications",
  cases: "lawyer-cases",
} as const;
