export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  createdAt: string;
  /** How this client entered the lawyer's workspace. */
  source: "MANUAL" | "CLIENT_REQUEST";
}

export const LAWYER_DOCUMENT_TYPES = [
  "Pleading",
  "Evidence",
  "Correspondence",
  "Court Order",
  "Agreement",
  "Other",
] as const;
export type LawyerDocumentType = (typeof LAWYER_DOCUMENT_TYPES)[number];

import type { DocumentAnalysisResult } from "./document";

export interface LawyerDocument {
  id: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  documentType: LawyerDocumentType;
  clientId: string;
  caseId?: string;
  uploadedAt: string;
  /** Session-only object URL — see note in useLawyerDocuments.ts. */
  objectUrl: string;
  analysis?: DocumentAnalysisResult | null;
}

export interface ResearchNote {
  id: string;
  clientId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const HEARING_TYPES = [
  "Preliminary Hearing",
  "Evidence",
  "Arguments",
  "Final Hearing",
  "Bail",
  "Mentioning",
  "Other",
] as const;

export type HearingStatus = "SCHEDULED" | "COMPLETED" | "ADJOURNED" | "CANCELLED";
export type HearingReminder = "NONE" | "1_DAY" | "3_DAYS" | "1_WEEK";

export interface Hearing {
  id: string;
  caseId: string;
  caseTitle: string;
  clientId: string;
  clientName: string;
  court: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  hearingType: string;
  status: HearingStatus;
  prepNotes?: string;
  reminder: HearingReminder;
  outcome?: string;
  createdAt: string;
  /** Set when the lawyer schedules a follow-up hearing from this one. */
  nextHearingId?: string;
}

export const LAWYER_DATA_BUCKETS = {
  clients: "lawyer-clients",
  documents: "lawyer-documents",
  researchNotes: "lawyer-research-notes",
  hearings: "lawyer-hearings",
} as const;
