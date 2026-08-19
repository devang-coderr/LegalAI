"use client";

import { useState } from "react";
import { OCRResult } from "@/types/document";
import { processDocumentOCR } from "@/services/document.api";

export function useDocuments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const uploadAndProcess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    const response = await processDocumentOCR(file);
    setIsLoading(false);

    if (response.success && response.data) {
      setOcrResult(response.data);
      return response.data;
    } else {
      setError(response.error?.message || "Failed to process OCR document.");
      return null;
    }
  };

  return {
    isLoading,
    error,
    ocrResult,
    uploadAndProcess,
  };
}
