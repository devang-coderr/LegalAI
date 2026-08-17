import type { Precedent } from "@/types/lawyer";

// Demo Data — sample judgments for interface development only.
export const MOCK_PRECEDENTS: Precedent[] = [
  {
    id: "prec-001",
    caseName: "Mehta v. Kulkarni",
    court: "Bombay High Court",
    year: 2019,
    citation: "2019 (SC) 4521",
    legalIssue: "Boundary encroachment — obligation of prior notice",
    excerpt: "The court held that construction without a joint boundary survey may constitute actionable encroachment.",
  },
  {
    id: "prec-002",
    caseName: "Rao v. State of Karnataka",
    court: "Karnataka High Court",
    year: 2021,
    citation: "2021 (KAR) 1187",
    legalIssue: "Municipal bye-law compliance in property disputes",
    excerpt: "Emphasized the requirement of municipal notice before structural modification near shared boundaries.",
  },
  {
    id: "prec-003",
    caseName: "Iyer v. Bhatt",
    court: "Delhi High Court",
    year: 2017,
    citation: "2017 (DEL) 3309",
    legalIssue: "Injunctive relief in property encroachment",
    excerpt: "Set out the standard for granting a temporary injunction pending survey verification.",
  },
];

export const MOCK_RESEARCH_ANSWER = {
  question: "What previous judgments are relevant to a boundary encroachment dispute?",
  answer:
    "Courts have generally required a joint boundary survey and prior written notice before construction near a shared property line. Where notice wasn't given, courts have been more willing to grant temporary injunctive relief pending verification.",
  citations: MOCK_PRECEDENTS,
};
