import { USE_MOCKS } from "@/lib/api-client";
import { OCRResult, DocumentQAAnswer, ManagedDocument, DocumentCategory, DocumentAnalysisResult } from "@/types/document";
import { ApiResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("legalai-token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Runs OCR + AI analysis on an uploaded document without saving to the database.
 */
export async function extractDocumentOCR(file: File, documentId?: string): Promise<ApiResponse<OCRResult>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      success: true,
      data: {
        documentId: documentId || `temp-${Date.now()}`,
        fileName: file.name,
        extractedText: `Document: ${file.name}\nUploaded successfully. Ready for legal scrutiny.`,
        summary: `Standard legal record analysis for ${file.name}.`,
        detectedDates: [
          { label: "Document Date", date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) }
        ],
        risks: [
          { clause: "General Terms", riskLevel: "LOW", explanation: "Standard statutory compliance.", recommendation: "Retain verified original copy." }
        ],
        missingChecklist: [
          { item: "Attestation / Verification", status: "VERIFIED" }
        ],
      },
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE}/documents/extract`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: null as unknown as OCRResult, error: { code: String(response.status), message: msg } };
    }

    const payload = json?.data?.ocr || json?.data || json;
    return {
      success: true,
      data: {
        documentId: payload.documentId || documentId || "",
        fileName: payload.fileName || file.name,
        extractedText: payload.extractedText || null,
        summary: payload.summary || null,
        detectedDates: payload.detectedDates || [],
        risks: payload.risks || [],
        missingChecklist: payload.missingChecklist || [],
        unavailableReason: payload.unavailableReason,
      },
    };
  } catch {
    return { success: false, data: null as unknown as OCRResult, error: { code: "NETWORK_ERROR", message: "Could not reach the document service. Check your connection and try again." } };
  }
}

/** Backwards-compatible alias */
export const processDocumentOCR = extractDocumentOCR;

/**
 * Persists a document permanently into backend database and file storage.
 */
export async function saveDocument(params: {
  file: File;
  category?: string;
  caseId?: string | null;
  clientId?: string | null;
  extractedText?: string | null;
  summary?: string | null;
  ocr?: OCRResult | null;
}): Promise<ApiResponse<ManagedDocument>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        id: `doc-${Date.now()}`,
        fileName: params.file.name,
        fileType: params.file.type,
        sizeBytes: params.file.size,
        category: (params.category || "Uncategorized") as DocumentCategory,
        uploadedAt: new Date().toISOString(),
        status: "ready",
        objectUrl: URL.createObjectURL(params.file),
        ocr: params.ocr || null,
        isSaved: true,
        caseId: params.caseId || null,
        clientId: params.clientId || null,
      },
    };
  }

  const formData = new FormData();
  formData.append("file", params.file);
  if (params.category) formData.append("category", params.category);
  if (params.caseId) formData.append("case_id", params.caseId);
  if (params.clientId) formData.append("client_id", params.clientId);
  if (params.extractedText) formData.append("extracted_text", params.extractedText);
  if (params.summary) formData.append("summary", params.summary);
  if (params.ocr) formData.append("ocr_result_json", JSON.stringify(params.ocr));

  try {
    const response = await fetch(`${API_BASE}/documents`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: null as unknown as ManagedDocument, error: { code: String(response.status), message: msg } };
    }

    const payload = json?.data || json;
    return {
      success: true,
      data: {
        id: payload.id,
        fileName: payload.fileName,
        fileType: payload.fileType,
        sizeBytes: payload.sizeBytes,
        category: payload.category as DocumentCategory,
        uploadedAt: payload.uploadedAt,
        status: payload.status,
        objectUrl: `${API_BASE}/documents/${payload.id}/file`,
        ocr: payload.ocr || null,
        isSaved: true,
        caseId: payload.caseId || null,
        clientId: payload.clientId || null,
      },
    };
  } catch {
    return { success: false, data: null as unknown as ManagedDocument, error: { code: "NETWORK_ERROR", message: "Failed to save document. Please check your connection." } };
  }
}

/**
 * Lists all persisted documents belonging to the authenticated user.
 */
export async function listUserDocuments(): Promise<ApiResponse<ManagedDocument[]>> {
  if (USE_MOCKS) {
    return { success: true, data: [] };
  }

  try {
    const response = await fetch(`${API_BASE}/documents`, {
      method: "GET",
      headers: authHeaders(),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: [], error: { code: String(response.status), message: msg } };
    }

    const list = json?.data || [];
    const items: ManagedDocument[] = list.map((item: any) => ({
      id: item.id,
      fileName: item.fileName,
      fileType: item.fileType,
      sizeBytes: item.sizeBytes,
      category: item.category as DocumentCategory,
      uploadedAt: item.uploadedAt,
      status: item.status,
      objectUrl: `${API_BASE}/documents/${item.id}/file`,
      ocr: item.ocr || null,
      isSaved: true,
      caseId: item.caseId || null,
      clientId: item.clientId || null,
    }));

    return { success: true, data: items };
  } catch {
    return { success: false, data: [], error: { code: "NETWORK_ERROR", message: "Could not load saved documents." } };
  }
}

/**
 * Lists all persisted documents attached to a specific case.
 */
export async function listCaseDocuments(caseId: string): Promise<ApiResponse<ManagedDocument[]>> {
  if (USE_MOCKS) {
    return { success: true, data: [] };
  }

  try {
    const response = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
      method: "GET",
      headers: authHeaders(),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: [], error: { code: String(response.status), message: msg } };
    }

    const list = json?.data || [];
    const items: ManagedDocument[] = list.map((item: any) => ({
      id: item.id,
      fileName: item.fileName,
      fileType: item.fileType,
      sizeBytes: item.sizeBytes,
      category: item.category as DocumentCategory,
      uploadedAt: item.uploadedAt,
      status: item.status,
      objectUrl: `${API_BASE}/documents/${item.id}/file`,
      ocr: item.ocr || null,
      isSaved: true,
      caseId: item.caseId || caseId,
      clientId: item.clientId || null,
    }));

    return { success: true, data: items };
  } catch {
    return { success: false, data: [], error: { code: "NETWORK_ERROR", message: "Could not load case documents." } };
  }
}

/**
 * Attaches or detaches a document to/from a case.
 */
export async function attachDocumentToCase(docId: string, caseId: string | null): Promise<ApiResponse<ManagedDocument>> {
  if (USE_MOCKS) {
    return { success: true, data: {} as ManagedDocument };
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${docId}/case`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ caseId }),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: null as unknown as ManagedDocument, error: { code: String(response.status), message: msg } };
    }

    const payload = json?.data || json;
    return {
      success: true,
      data: {
        id: payload.id,
        fileName: payload.fileName,
        fileType: payload.fileType,
        sizeBytes: payload.sizeBytes,
        category: payload.category as DocumentCategory,
        uploadedAt: payload.uploadedAt,
        status: payload.status,
        objectUrl: `${API_BASE}/documents/${payload.id}/file`,
        ocr: payload.ocr || null,
        isSaved: true,
        caseId: payload.caseId || null,
        clientId: payload.clientId || null,
      },
    };
  } catch {
    return { success: false, data: null as unknown as ManagedDocument, error: { code: "NETWORK_ERROR", message: "Could not update case attachment." } };
  }
}

/**
 * Deletes a document from the backend permanent storage.
 */
export async function deleteDocumentApi(docId: string): Promise<ApiResponse<boolean>> {
  if (USE_MOCKS) {
    return { success: true, data: true };
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${docId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: false, error: { code: String(response.status), message: msg } };
    }
    return { success: true, data: true };
  } catch {
    return { success: false, data: false, error: { code: "NETWORK_ERROR", message: "Could not delete document." } };
  }
}

/**
 * Updates a document's category.
 */
export async function updateDocumentCategory(docId: string, category: string): Promise<ApiResponse<boolean>> {
  if (USE_MOCKS) {
    return { success: true, data: true };
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${docId}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ category }),
    });
    return { success: response.ok, data: response.ok };
  } catch {
    return { success: false, data: false };
  }
}

/** Generates structured, strictly grounded AI intelligence for a document. */
export async function analyzeDocument(documentId: string): Promise<ApiResponse<DocumentAnalysisResult>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      data: {
        documentId,
        fileName: "Document.pdf",
        documentType: "Legal Notice",
        summary: "This is a sample document summary.",
        parties: [{ name: "Party A", role: "Claimant" }, { name: "Party B", role: "Respondent" }],
        dates: [{ label: "Notice Date", date: "05 Sep 2026" }],
        amounts: ["₹50,000"],
        keyFacts: ["Demand for payment.", "Outstanding dues."],
        importantClauses: [{ title: "Demand", content: "Demand to pay within 15 days." }],
        obligations: [{ party: "Party B", obligation: "Pay outstanding dues." }],
        statutoryProvisions: [{ provision: "Section 138, NI Act", explicitlyMentioned: true, notes: "Referenced in notice" }],
        missingInfo: [],
        contradictions: [],
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${documentId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: null as unknown as DocumentAnalysisResult, error: { code: String(response.status), message: msg } };
    }

    const payload = json?.data || json;
    return {
      success: true,
      data: {
        documentId: payload.documentId || documentId,
        fileName: payload.fileName || "",
        documentType: payload.documentType || "Unknown",
        summary: payload.summary || "",
        parties: payload.parties || [],
        dates: payload.dates || [],
        amounts: payload.amounts || [],
        keyFacts: payload.keyFacts || [],
        importantClauses: payload.importantClauses || [],
        obligations: payload.obligations || [],
        statutoryProvisions: payload.statutoryProvisions || [],
        missingInfo: payload.missingInfo || [],
        contradictions: payload.contradictions || [],
      },
    };
  } catch {
    return { success: false, data: null as unknown as DocumentAnalysisResult, error: { code: "NETWORK_ERROR", message: "Unable to analyze document at this time." } };
  }
}

/** Answers a question grounded in a specific, already-processed document. */
export async function askDocumentQuestion(documentId: string, question: string): Promise<ApiResponse<DocumentQAAnswer>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      success: true,
      data: {
        question,
        answer: `Regarding "${question}": The document outlines obligations and procedural rights. Review the extracted clauses above for detailed terms.`,
        answeredAt: new Date().toISOString(),
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${documentId}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ question }),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = json?.message || json?.error?.message || humanizeStatus(response.status);
      return { success: false, data: null as unknown as DocumentQAAnswer, error: { code: String(response.status), message: msg } };
    }

    const payload = json?.data || json;
    return {
      success: true,
      data: {
        question: payload.question || question,
        answer: payload.answer || "Answer generated based on document context.",
        answeredAt: payload.answeredAt || new Date().toISOString(),
      },
    };
  } catch {
    return { success: false, data: null as unknown as DocumentQAAnswer, error: { code: "NETWORK_ERROR", message: "Unable to answer this question right now." } };
  }
}

function humanizeStatus(status: number): string {
  switch (status) {
    case 400: return "That file couldn't be processed — it may be invalid or corrupted.";
    case 401: return "Your session has expired. Please sign in again.";
    case 403: return "You don't have access to this document.";
    case 404: return "This document could not be found.";
    case 413: return "This file is too large to upload.";
    case 422: return "This file couldn't be validated. Please check the format and try again.";
    case 500: return "Something went wrong on our end. Please try again shortly.";
    default: return "Something went wrong. Please try again.";
  }
}
