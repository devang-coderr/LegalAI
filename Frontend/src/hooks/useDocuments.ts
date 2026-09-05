"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentCategory, DocumentQAAnswer, ManagedDocument } from "@/types/document";
import {
  askDocumentQuestion,
  attachDocumentToCase,
  deleteDocumentApi,
  extractDocumentOCR,
  listUserDocuments,
  saveDocument as saveDocumentApi,
  updateDocumentCategory,
} from "@/services/document.api";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateDocumentFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload a PDF, JPG or PNG.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "This file is too large. Maximum size is 15MB.";
  }
  return null;
}

function inferCategoryHint(fileName: string): ManagedDocument["category"] {
  const n = fileName.toLowerCase();
  if (/notice|summon/.test(n)) return "Notice";
  if (/agreement|contract|lease|rent/.test(n)) return "Agreement";
  if (/order|judgment|decree/.test(n)) return "Court Order";
  if (/property|deed|title|sale/.test(n)) return "Property Document";
  if (/aadhaar|pan|passport|id\b/.test(n)) return "ID / Other";
  return "Uncategorized";
}

export function useDocuments() {
  const [documents, setDocuments] = useState<ManagedDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<Record<string, DocumentQAAnswer[]>>({});
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // Load saved documents from backend on mount
  const refreshDocuments = useCallback(async () => {
    setIsLoadingList(true);
    const res = await listUserDocuments();
    setIsLoadingList(false);
    if (res.success && res.data) {
      setDocuments((prev) => {
        // Keep any unsaved local drafts from current session
        const unsaved = prev.filter((d) => !d.isSaved);
        const serverDocs = res.data;
        const merged = [...unsaved, ...serverDocs];
        return merged;
      });
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, []);

  const selectedDocument = documents.find((d) => d.id === selectedId) ?? null;

  const uploadDocument = useCallback(async (file: File) => {
    const tempId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const objectUrl = URL.createObjectURL(file);

    const draft: ManagedDocument = {
      id: tempId,
      fileName: file.name,
      fileType: file.type,
      sizeBytes: file.size,
      category: inferCategoryHint(file.name),
      uploadedAt: new Date().toISOString(),
      status: "processing",
      objectUrl,
      ocr: null,
      isSaved: false,
    };

    setPendingFiles((prev) => ({ ...prev, [tempId]: file }));
    setDocuments((prev) => [draft, ...prev]);
    setSelectedId(tempId);

    const response = await extractDocumentOCR(file, tempId);

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === tempId
          ? response.success
            ? { ...d, status: "ready", ocr: response.data }
            : { ...d, status: "failed", errorMessage: response.error?.message || "Processing failed." }
          : d
      )
    );

    return tempId;
  }, []);

  const retryProcessing = useCallback(async (id: string, file: File) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: "processing", errorMessage: undefined } : d)));
    const response = await extractDocumentOCR(file, id);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? response.success
            ? { ...d, status: "ready", ocr: response.data }
            : { ...d, status: "failed", errorMessage: response.error?.message || "Processing failed." }
          : d
      )
    );
  }, []);

  const saveDocument = useCallback(async (id: string, caseId?: string | null) => {
    const doc = documents.find((d) => d.id === id);
    const file = pendingFiles[id];
    if (!doc || !file) {
      return { success: false, error: "Document file not found in session." };
    }

    setSavingId(id);
    const res = await saveDocumentApi({
      file,
      category: doc.category,
      caseId: caseId || doc.caseId || null,
      extractedText: doc.ocr?.extractedText,
      summary: doc.ocr?.summary,
      ocr: doc.ocr,
    });
    setSavingId(null);

    if (res.success && res.data) {
      const savedDoc = res.data;
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? savedDoc : d))
      );
      if (selectedId === id) {
        setSelectedId(savedDoc.id);
      }
      // Clean up pending file
      setPendingFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return { success: true, data: savedDoc };
    }

    return { success: false, error: res.error?.message || "Failed to save document." };
  }, [documents, pendingFiles, selectedId]);

  const attachToCase = useCallback(async (docId: string, caseId: string | null) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return { success: false };

    if (!doc.isSaved) {
      // If it's a draft, just update local state
      setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, caseId } : d)));
      return { success: true };
    }

    const res = await attachDocumentToCase(docId, caseId);
    if (res.success && res.data) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, caseId: res.data.caseId } : d))
      );
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error?.message };
  }, [documents]);

  const deleteDocument = useCallback(async (id: string) => {
    const target = documents.find((d) => d.id === id);
    if (target?.isSaved) {
      await deleteDocumentApi(id);
    } else if (target) {
      URL.revokeObjectURL(target.objectUrl);
    }

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setPendingFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, [documents]);

  const setCategory = useCallback(async (id: string, category: DocumentCategory) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, category } : d)));
    const doc = documents.find((d) => d.id === id);
    if (doc?.isSaved) {
      await updateDocumentCategory(id, category);
    }
  }, [documents]);

  const askQuestion = useCallback(async (id: string, question: string) => {
    setQaLoading(true);
    setQaError(null);
    const response = await askDocumentQuestion(id, question);
    setQaLoading(false);
    if (response.success) {
      setQaHistory((prev) => ({ ...prev, [id]: [...(prev[id] || []), response.data] }));
    } else {
      setQaError(response.error?.message || "Unable to answer this question right now.");
    }
  }, []);

  return {
    documents,
    selectedDocument,
    selectedId,
    selectDocument: setSelectedId,
    uploadDocument,
    retryProcessing,
    saveDocument,
    attachToCase,
    deleteDocument,
    setCategory,
    askQuestion,
    qaHistory: selectedId ? qaHistory[selectedId] || [] : [],
    qaLoading,
    qaError,
    isLoadingList,
    savingId,
    refreshDocuments,
    pendingFiles,
  };
}
