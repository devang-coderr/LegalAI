import { ApplicableLaw, Precedent, LegalIssue } from "./case";

export interface Citation {
  id: string;
  title: string;
  citationNumber: string;
  court: string;
  judgmentDate: string;
  excerpt: string;
  sourceUrl?: string;
  ratioDecidendi: string;
}

export interface LegalResearchResult {
  query: string;
  aiExplanation: string;
  legalIssues: LegalIssue[];
  applicableLaws: ApplicableLaw[];
  citations: Citation[];
  precedents: Precedent[];
}
