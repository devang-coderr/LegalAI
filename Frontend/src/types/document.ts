export interface DocumentRisk {
  clause: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
}

export interface DocumentParty {
  name: string;
  role: string;
}

export interface DocumentDate {
  label: string;
  date: string;
}

export interface DocumentClause {
  title: string;
  content: string;
}

export interface DocumentObligation {
  party: string;
  obligation: string;
}

export interface DocumentStatutoryProvision {
  provision: string;
  explicitlyMentioned?: boolean;
  notes?: string;
}

export interface DocumentAnalysisResult {
  documentId: string;
  fileName: string;
  documentType: string;
  summary: string;
  parties: DocumentParty[];
  dates: DocumentDate[];
  amounts: string[];
  keyFacts: string[];
  importantClauses: DocumentClause[];
  obligations: DocumentObligation[];
  statutoryProvisions: DocumentStatutoryProvision[];
  missingInfo: string[];
  contradictions: string[];
}

export interface OCRResult {
  documentId: string;
  fileName: string;
  /** Null when text extraction has not completed or is not available yet — never fabricated. */
  extractedText: string | null;
  summary: string | null;
  detectedDates: { label: string; date: string }[];
  risks: DocumentRisk[];
  missingChecklist: { item: string; status: "VERIFIED" | "MISSING" | "OPTIONAL" }[];
  /** Present when a capability could not run (e.g. no OCR backend connected yet). */
  unavailableReason?: string;
  analysis?: DocumentAnalysisResult | null;
}

export const DOCUMENT_CATEGORIES = [
  "Notice",
  "Agreement",
  "Court Order",
  "Property Document",
  "ID / Other",
  "Uncategorized",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type DocumentProcessingStatus =
  | "uploading"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface ManagedDocument {
  id: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  category: DocumentCategory;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  objectUrl: string;
  ocr: OCRResult | null;
  analysis?: DocumentAnalysisResult | null;
  errorMessage?: string;
  isSaved?: boolean;
  caseId?: string | null;
  clientId?: string | null;
}


export interface DocumentQAAnswer {
  question: string;
  answer: string;
  answeredAt: string;
}

