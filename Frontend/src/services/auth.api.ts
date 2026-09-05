import { apiClient, USE_MOCKS } from "@/lib/api-client";
import { getSession, makeInitials, SessionUser, setSession, UserRole, VerificationStatus } from "@/lib/auth";
import { ApiResponse } from "@/types/api";

export interface AuthData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
    barNumber?: string;
    barCouncil?: string;
    courtAdmission?: string;
    court?: string;
    location?: string;
    practiceAreas?: string[];
    languages?: string[];
    experienceYears?: number;
    verificationStatus?: VerificationStatus;
  };
}

export async function loginApi(
  email: string,
  password: string,
  role?: UserRole
): Promise<ApiResponse<AuthData>> {
  if (USE_MOCKS) {
    const user: SessionUser = {
      id: role === "LAWYER" ? "lawyer-1" : "citizen-1",
      name: role === "LAWYER" ? "Adv. Rajesh Sharma" : "Aarav Sharma",
      email,
      role: role || "CITIZEN",
      initials: role === "LAWYER" ? "RS" : "AS",
      barNumber: role === "LAWYER" ? "D/1420/2006" : undefined,
      barCouncil: role === "LAWYER" ? "Bar Council of Delhi" : undefined,
      verificationStatus: role === "LAWYER" ? "VERIFIED" : undefined,
    };
    setSession(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("legalai-token", "mock-jwt-token");
    }
    return {
      success: true,
      data: {
        token: "mock-jwt-token",
        user,
      },
    };
  }

  const res = await apiClient<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });

  if (res.success && res.data?.token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("legalai-token", res.data.token);
    }
    const u = res.data.user;
    const sessionUser: SessionUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      initials: makeInitials(u.name),
      barNumber: u.barNumber,
      barCouncil: u.barCouncil,
      court: u.court || u.courtAdmission,
      location: u.location,
      practiceAreas: u.practiceAreas,
      languages: u.languages,
      experienceYears: u.experienceYears,
      verificationStatus: u.verificationStatus,
    };
    setSession(sessionUser);
  }

  return res;
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  barNumber?: string;
  barCouncil?: string;
  courtAdmission?: string;
  court?: string;
  location?: string;
  practiceAreas?: string[];
  languages?: string[];
  experienceYears?: number;
}): Promise<ApiResponse<AuthData>> {
  if (USE_MOCKS) {
    const sessionUser: SessionUser = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone,
      initials: makeInitials(payload.name),
      barNumber: payload.barNumber,
      barCouncil: payload.barCouncil,
      court: payload.court || payload.courtAdmission,
      location: payload.location,
      practiceAreas: payload.practiceAreas,
      languages: payload.languages,
      experienceYears: payload.experienceYears,
      verificationStatus: payload.role === "LAWYER" ? "PENDING" : undefined,
    };
    setSession(sessionUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("legalai-token", "mock-jwt-token");
    }
    return {
      success: true,
      data: {
        token: "mock-jwt-token",
        user: sessionUser,
      },
    };
  }

  const res = await apiClient<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.success && res.data?.token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("legalai-token", res.data.token);
    }
    const u = res.data.user;
    const sessionUser: SessionUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      initials: makeInitials(u.name),
      barNumber: u.barNumber,
      barCouncil: u.barCouncil,
      court: u.court || u.courtAdmission,
      location: u.location,
      practiceAreas: u.practiceAreas,
      languages: u.languages,
      experienceYears: u.experienceYears,
      verificationStatus: u.verificationStatus,
    };
    setSession(sessionUser);
  }

  return res;
}

export async function getMeApi(): Promise<ApiResponse<AuthData["user"]>> {
  return apiClient<AuthData["user"]>("/auth/me");
}

export async function updateProfileApi(patch: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  barNumber?: string;
  barCouncil?: string;
  courtAdmission?: string;
  court?: string;
  location?: string;
  practiceAreas?: string[];
  languages?: string[];
  experienceYears?: number;
}): Promise<ApiResponse<AuthData["user"]>> {
  const res = await apiClient<AuthData["user"]>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (res.success && res.data) {
    const u = res.data;
    const current = getSession();
    if (current) {
      setSession({
        ...current,
        name: u.name ?? current.name,
        phone: u.phone ?? current.phone,
        barNumber: u.barNumber ?? current.barNumber,
        barCouncil: u.barCouncil ?? current.barCouncil,
        court: u.court ?? u.courtAdmission ?? current.court,
        location: u.location ?? current.location,
        practiceAreas: u.practiceAreas ?? current.practiceAreas,
        languages: u.languages ?? current.languages,
        experienceYears: u.experienceYears ?? current.experienceYears,
        verificationStatus: u.verificationStatus ?? current.verificationStatus,
      });
    }
  }
  return res;
}
