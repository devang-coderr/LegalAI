"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { LawyerDocument, LawyerDocumentType } from "@/types/lawyer";
import { apiClient } from "@/lib/api-client";

let documents: LawyerDocument[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return documents;
}

function getServerSnapshot(): LawyerDocument[] {
  return [];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("legalai-token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function addLawyerDocument(
  file: File,
  meta: { clientId: string; caseId?: string; documentType: LawyerDocumentType }
): Promise<LawyerDocument> {
  const tempId = `ldoc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const objectUrl = URL.createObjectURL(file);

  const localDoc: LawyerDocument = {
    id: tempId,
    fileName: file.name,
    fileType: file.type,
    sizeBytes: file.size,
    documentType: meta.documentType,
    clientId: meta.clientId,
    caseId: meta.caseId,
    uploadedAt: new Date().toISOString(),
    objectUrl,
  };

  documents = [localDoc, ...documents];
  emit();

  // Async backend persist & OCR
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", meta.documentType);
    formData.append("client_id", meta.clientId);
    if (meta.caseId) formData.append("case_id", meta.caseId);
    formData.append("document_type", meta.documentType);

    const response = await fetch(`${API_BASE}/documents/ocr`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      if (json?.data?.id) {
        documents = documents.map((d) => (d.id === tempId ? { ...d, id: json.data.id } : d));
        emit();
      }
    }
  } catch {
    // Retain localDoc for active session
  }

  return localDoc;
}

export async function removeLawyerDocument(id: string): Promise<void> {
  const target = documents.find((d) => d.id === id);
  if (target) URL.revokeObjectURL(target.objectUrl);
  documents = documents.filter((d) => d.id !== id);
  emit();

  try {
    await apiClient(`/documents/${id}`, { method: "DELETE" });
  } catch {
    // Non-blocking
  }
}

export function useLawyerDocuments() {
  const docs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    async function fetchServerDocuments() {
      const res = await apiClient<Array<{
        id: string;
        fileName: string;
        fileType: string;
        sizeBytes: number;
        category?: string;

        documentType?: string;
        clientId?: string;
        caseId?: string;
        uploadedAt: string;
      }>>("/documents");

      if (res.success && res.data && res.data.length > 0) {
        const loaded: LawyerDocument[] = res.data.map((d: any) => ({
          id: d.id,
          fileName: d.fileName,
          fileType: d.fileType,
          sizeBytes: d.sizeBytes,
          documentType: (d.documentType || d.category || "Other") as LawyerDocumentType,
          clientId: d.clientId || "",
          caseId: d.caseId,
          uploadedAt: d.uploadedAt,
          objectUrl: `${API_BASE}/documents/${d.id}/file`,
          analysis: d.analysis || d.ocr?.analysis || null,
        }));

        // Merge with any in-flight documents
        const existingIds = new Set(documents.map((x) => x.id));
        const newFromBackend = loaded.filter((x) => !existingIds.has(x.id));
        if (newFromBackend.length > 0) {
          documents = [...documents, ...newFromBackend];
          emit();
        }
      }
    }

    fetchServerDocuments();
  }, []);

  const updateDocumentAnalysis = (id: string, analysis: any) => {
    documents = documents.map((d) => (d.id === id ? { ...d, analysis } : d));
    emit();
  };

  return {
    documents: docs,
    uploadDocument: addLawyerDocument,
    deleteDocument: removeLawyerDocument,
    updateDocumentAnalysis,
    documentsForClient: (clientId: string) => docs.filter((d) => d.clientId === clientId),
    documentsForCase: (caseId: string) => docs.filter((d) => d.caseId === caseId),
  };
}
