import { CaseIntelligenceResult } from "@/types/case";

export const MOCK_CASE_INTELLIGENCE: CaseIntelligenceResult = {
  caseId: "case-mock-001",
  summary: "Security deposit forfeiture dispute arising from commercial residential tenancy.",
  facts: {
    overview: "Tenant vacated flat after serving 30-day written notice. Landlord refused ₹75,000 deposit refund citing routine wear and tear.",
    keyEvents: [
      { date: "01 April 2025", event: "Tenancy Agreement Executed" },
      { date: "01 May 2026", event: "Written 30-day Vacate Notice Served" },
      { date: "01 June 2026", event: "Keys Handed Over; Refund Refused" },
    ],
    parties: { plaintiff: "You (Tenant)", defendant: "Ramesh Chand (Landlord)" },
  },
  issues: [
    {
      id: "iss-1",
      title: "Arbitrary Forfeiture of Security Deposit",
      description: "Landlord retains ₹75,000 without providing itemized repair estimates.",
      severity: "HIGH",
    },
  ],
  applicableLaws: [
    {
      actName: "Transfer of Property Act, 1882",
      section: "Section 108(m)",
      title: "Duty of Lessee to Restore Property",
      explanation: "Lessee is bound to keep property in good condition, subject to reasonable wear and tear.",
    },
  ],
  precedents: [
    {
      id: "prec-1",
      caseName: "K.P. Moolchand vs. State of Delhi",
      citation: "(2018) SCC Online Del 942",
      court: "High Court of Delhi",
      year: 2018,
      relevanceScore: 0.98,
      summary: "Arbitrary withholding of tenant security deposit without proof of physical damage is illegal.",
      whyRelevant: "Directly matches facts regarding 30-day notice and deposit retention.",
    },
  ],
  recommendedSteps: [
    "Issue formal legal notice demanding ₹75,000 refund within 15 days.",
    "File complaint before Rent Controller or Consumer Disputes Commission.",
  ],
  disclaimer: "LegalAI provides AI-assisted legal research and information. It does not replace advocate representation.",
};
