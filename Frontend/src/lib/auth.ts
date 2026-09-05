export type UserRole = "CITIZEN" | "LAWYER";
export type VerificationStatus = "VERIFIED" | "PENDING" | "REJECTED";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  phone?: string;
  barNumber?: string;
  barCouncil?: string;
  court?: string;
  location?: string;
  practiceAreas?: string[];
  languages?: string[];
  experienceYears?: number;
  verificationStatus?: VerificationStatus;
};

const SESSION_KEY = "legalai-session";
const PROFILE_KEY = "legalai-profile";

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
}

export function updateSession(patch: Partial<SessionUser>) {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  setSession(next);
  return next;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function makeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LA";
}

export function demoUser(role: UserRole): SessionUser {
  if (role === "LAWYER") {
    return {
      id: "demo-lawyer",
      name: "Adv. Rajesh Sharma",
      email: "rajesh@lawchambers.in",
      role,
      initials: "RS",
      barNumber: "MAH/1234/2015",
      barCouncil: "Bar Council of Maharashtra & Goa",
      verificationStatus: "VERIFIED",
    };
  }
  return {
    id: "demo-citizen",
    name: "Anil Kumar",
    email: "anil@example.com",
    role,
    initials: "AK",
  };
}
