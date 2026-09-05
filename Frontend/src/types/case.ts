export interface CaseFacts {
  overview: string;
  keyEvents: { date?: string; event: string }[];
  parties: { plaintiff: string; defendant: string };
}

export interface LegalIssue {
  id: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface ApplicableLaw {
  actName: string;
  section: string;
  title: string;
  explanation: string;
}

export interface Precedent {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  year: number;
  relevanceScore: number;
  summary: string;
  whyRelevant: string;
}

export interface CaseIntelligenceResult {
  caseId?: string;
  summary: string;
  facts: CaseFacts;
  issues: LegalIssue[];
  applicableLaws: ApplicableLaw[];
  precedents: Precedent[];
  recommendedSteps: string[];
  disclaimer: string;
}

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  court: string;
  bench?: string;
  clientId?: string;
  clientName: string;
  caseType?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  assignedLawyer?: string;
  description?: string;
  status: "ACTIVE" | "PENDING" | "SETTLED" | "CLOSED" | "UPCOMING_HEARING";
  statutoryActs: string;
  nextHearingDate?: string;
  intelligence?: CaseIntelligenceResult;
  /** Present on lawyer-owned cases; not used for citizen cases. */
  ownerLawyerId?: string;
}
