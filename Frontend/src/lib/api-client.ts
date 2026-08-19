import { ApiResponse, ApiError } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS !== undefined
    ? process.env.NEXT_PUBLIC_USE_MOCKS === "true"
    : true;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("legalai-token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        code: "HTTP_ERROR",
        message: `HTTP Error ${response.status}: ${response.statusText}`,
      }));

      return {
        success: false,
        data: null as unknown as T,
        error: errorData,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to connect to LegalAI API backend.";
    return {
      success: false,
      data: null as unknown as T,
      error: {
        code: "NETWORK_FAILURE",
        message: errMessage,
      },
    };
  }
}
