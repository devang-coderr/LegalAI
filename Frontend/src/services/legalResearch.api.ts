import { USE_MOCKS, apiClient } from "@/lib/api-client";
import { LegalResearchResult } from "@/types/legal";
import { ApiResponse } from "@/types/api";

export async function searchLegalResearch(
  query: string,
  court: string = "ALL",
  sourceType?: string
): Promise<ApiResponse<LegalResearchResult>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      data: {
        query,
        aiExplanation: `Under Indian jurisprudence, query "${query}" involves statutory interpretations of procedural and substantive laws.`,
        legalIssues: [
          { id: "1", title: "Procedural Non-Compliance", description: "Failure to adhere to statutory service timelines.", severity: "MEDIUM" },
        ],
        applicableLaws: [
          { actName: "Code of Civil Procedure, 1908", section: "Order 9 Rule 13", title: "Setting Aside Ex-Parte Decree", explanation: "Allows court to set aside decree upon proof of sufficient cause." },
        ],
        citations: [
          {
            id: "cit-mock-1",
            title: "G.P. Srivastava vs. R.K. Raizada & Ors.",
            citationNumber: "(2000) 3 SCC 54",
            court: "Supreme Court of India",
            judgmentDate: "2000-03-02",
            excerpt: "Sufficient cause under Order 9 Rule 13 CPC must be liberally construed.",
            ratioDecidendi: "Liberal construction of sufficient cause for non-appearance.",
            category: "judgment",
            sourceType: "Judgment",
          },
        ],
        precedents: [],
      },
    };
  }

  return apiClient<LegalResearchResult>("/legal/research", {
    method: "POST",
    body: JSON.stringify({ query, court, sourceType }),
  });
}
