export interface DocumentRisk {
  clause: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
}

export interface OCRResult {
  documentId: string;
  fileName: string;
  extractedText: string;
  summary: string;
  detectedDates: { label: string; date: string }[];
  risks: DocumentRisk[];
  missingChecklist: { item: string; status: "VERIFIED" | "MISSING" | "OPTIONAL" }[];
}
