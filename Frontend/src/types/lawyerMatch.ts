export interface LawyerMatchRequest {
  expertise: string;
  caseDescription: string;
  location: string;
  language: string;
}

export interface MatchedLawyer {
  id: string;
  name: string;
  expertise: string[];
  location: string;
  languages: string[];
  experienceYears: number;
  rating: number;
  barCouncil?: string;
}
