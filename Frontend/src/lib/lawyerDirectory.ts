/**
 * Lawyer Directory types and constants.
 * All lawyer discovery is authoritative and fetched from registered database profiles.
 */

export interface DirectoryLawyer {
  id: string;
  name: string;
  expertise: string[];
  location: string;
  languages: string[];
  experienceYears: number;
  barCouncil: string;
}

export const KNOWN_LAWYERS: DirectoryLawyer[] = [];
