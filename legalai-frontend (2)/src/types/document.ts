export type DocumentStatus = "uploading" | "processing" | "analyzed" | "error";

export interface UploadedDocument {
  id: string;
  name: string;
  sizeLabel: string;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface DocumentAnalysis {
  summary: string;
  keySections: string[];
  importantClauses: string[];
  importantDates: string[];
  detectedTerms: string[];
}

export type NotificationType =
  | "hearing"
  | "consultation"
  | "document"
  | "research"
  | "case_update"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface Hearing {
  id: string;
  caseTitle: string;
  clientName: string;
  court: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "adjourned";
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  activeCases: number;
  lastContact: string;
  email: string;
}
