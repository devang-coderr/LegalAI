import type { Lawyer } from "@/types/lawyer";

// Demo Data — sample profiles for interface development only.
export const MOCK_LAWYERS: Lawyer[] = [
  {
    id: "law-001",
    name: "Adv. Kavita Rao",
    court: "Delhi High Court",
    location: "New Delhi",
    experienceYears: 12,
    languages: ["English", "Hindi"],
    practiceAreas: ["Property Law", "Civil Litigation"],
    rating: 4.8,
  },
  {
    id: "law-002",
    name: "Adv. Rohan Mehta",
    court: "Bombay High Court",
    location: "Mumbai",
    experienceYears: 8,
    languages: ["English", "Hindi", "Marathi"],
    practiceAreas: ["Employment Law", "Contract Disputes"],
    rating: 4.6,
  },
  {
    id: "law-003",
    name: "Adv. Fatima Sheikh",
    court: "District Court, Bengaluru",
    location: "Bengaluru",
    experienceYears: 15,
    languages: ["English", "Kannada", "Urdu"],
    practiceAreas: ["Family Law", "Tenancy Disputes"],
    rating: 4.9,
  },
];
