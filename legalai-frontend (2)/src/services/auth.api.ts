import { apiRequest, USE_MOCKS } from "@/lib/api-client";
import type { ApiResponse, AuthenticatedUser, LoginPayload, RegisterPayload } from "@/types/auth";

function mockDelay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function login(payload: LoginPayload): Promise<ApiResponse<AuthenticatedUser>> {
  if (USE_MOCKS) {
    return mockDelay({
      success: true,
      data: { id: "demo-user", name: "Demo User", role: "citizen", email: payload.identifier },
      message: "Demo Data — mock login, no real authentication performed.",
      error: null,
    });
  }
  return apiRequest<ApiResponse<AuthenticatedUser>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(
  payload: RegisterPayload
): Promise<ApiResponse<AuthenticatedUser>> {
  if (USE_MOCKS) {
    return mockDelay({
      success: true,
      data: { id: "demo-user", name: payload.name, role: payload.role, email: payload.identifier },
      message: "Demo Data — mock registration, no account was created.",
      error: null,
    });
  }
  return apiRequest<ApiResponse<AuthenticatedUser>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
