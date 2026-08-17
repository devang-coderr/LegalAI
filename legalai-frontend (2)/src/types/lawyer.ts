export interface Lawyer {
  id: string;
  name: string;
  court: string;
  location: string;
  experienceYears: number;
  languages: string[];
  practiceAreas: string[];
  rating?: number;
}

export interface Precedent {
  id: string;
  caseName: string;
  court: string;
  year: number;
  citation: string;
  legalIssue: string;
  excerpt: string;
}
