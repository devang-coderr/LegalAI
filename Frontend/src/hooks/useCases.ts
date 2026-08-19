"use client";

import { useState } from "react";
import { CaseIntelligenceResult } from "@/types/case";
import { analyzeCaseIntelligence } from "@/services/case.api";

export function useCases() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intelligenceResult, setIntelligenceResult] = useState<CaseIntelligenceResult | null>(null);

  const solveCase = async (query: string) => {
    setIsLoading(true);
    setError(null);
    const response = await analyzeCaseIntelligence(query);
    setIsLoading(false);

    if (response.success && response.data) {
      setIntelligenceResult(response.data);
      return response.data;
    } else {
      const errMsg = response.error?.message || "Failed to analyze case intelligence.";
      setError(errMsg);
      return null;
    }
  };

  return {
    isLoading,
    error,
    intelligenceResult,
    solveCase,
  };
}
