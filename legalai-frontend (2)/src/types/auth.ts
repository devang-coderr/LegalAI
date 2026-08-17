export type UserRole = "citizen" | "lawyer";

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterPayload {
  name: string;
  identifier: string;
  password: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

// TEMPORARY FRONTEND CONTRACT — see FRONTEND_INTEGRATION.md.
// Mirrors the ApiResponse<T> envelope the backend team is expected to return.
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}
