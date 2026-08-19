"use client";

import { useState } from "react";
import { LegalResearchResult } from "@/types/legal";
import { searchLegalResearch } from "@/services/legalResearch.api";

export function useLegalResearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<LegalResearchResult | null>(null);

  const performResearch = async (query: string, court: string = "ALL") => {
    setIsLoading(true);
    setError(null);
    const response = await searchLegalResearch(query, court);
    setIsLoading(false);

    if (response.success && response.data) {
      setResearchResult(response.data);
      return response.data;
    } else {
      setError(response.error?.message || "Failed to perform legal research.");
      return null;
    }
  };

  return {
    isLoading,
    error,
    researchResult,
    performResearch,
  };
}
