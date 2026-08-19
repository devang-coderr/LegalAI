import { USE_MOCKS, apiClient } from "@/lib/api-client";
import { CaseIntelligenceResult } from "@/types/case";
import { ApiResponse } from "@/types/api";
import { MOCK_CASE_INTELLIGENCE } from "@/mocks/db.mock";

export async function analyzeCaseIntelligence(
  query: string
): Promise<ApiResponse<CaseIntelligenceResult>> {
  if (USE_MOCKS) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      data: {
        ...MOCK_CASE_INTELLIGENCE,
        summary: `Analysis for: "${query}". ${MOCK_CASE_INTELLIGENCE.summary}`,
      },
    };
  }

  return apiClient<CaseIntelligenceResult>("/cases/intelligence", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
