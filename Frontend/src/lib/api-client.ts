import { ApiResponse, ApiError } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS !== undefined
    ? process.env.NEXT_PUBLIC_USE_MOCKS === "true"
    : false;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("legalai-token") : null;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      if (json && typeof json === "object" && "error" in json && json.error) {
        return {
          success: false,
          data: null as unknown as T,
          error: json.error,
          message: json.message || `HTTP Error ${response.status}`,
        };
      }

      return {
        success: false,
        data: null as unknown as T,
        error: {
          code: `HTTP_${response.status}`,
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        },
      };
    }

    if (json && typeof json === "object" && "success" in json && "data" in json) {
      return json as ApiResponse<T>;
    }

    return {
      success: true,
      data: json as T,
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
