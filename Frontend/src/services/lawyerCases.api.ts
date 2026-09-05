import { apiClient, USE_MOCKS } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Case } from "@/types/case";
import { appendToBucket, currentUserId, readBucket, updateBucketItem } from "@/lib/workspace-store";

const BUCKET = "lawyer-cases";

export async function listLawyerCases(): Promise<ApiResponse<Case[]>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const userId = currentUserId();
    if (!userId) {
      return { success: false, data: [], error: { code: "NO_SESSION", message: "You must be signed in to view your cases." } };
    }
    return { success: true, data: readBucket<Case>(BUCKET, userId) };
  }

  const res = await apiClient<Case[]>("/cases");
  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  return { success: true, data: userId ? readBucket<Case>(BUCKET, userId) : [] };
}

export async function createLawyerCase(input: Omit<Case, "id">): Promise<ApiResponse<Case>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const userId = currentUserId();
    if (!userId) {
      return { success: false, data: null as unknown as Case, error: { code: "NO_SESSION", message: "You must be signed in." } };
    }
    const newCase: Case = { ...input, id: `case-${crypto.randomUUID()}` };
    appendToBucket<Case>(BUCKET, userId, newCase, 200);
    return { success: true, data: newCase };
  }

  const res = await apiClient<Case>("/cases", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  const fallbackCase: Case = { ...input, id: `case-${Date.now()}` };
  if (userId) appendToBucket<Case>(BUCKET, userId, fallbackCase, 200);
  return { success: true, data: fallbackCase };
}

export async function updateLawyerCase(id: string, patch: Partial<Case>): Promise<ApiResponse<Case[]>> {
  if (!USE_MOCKS) {
    await apiClient<Case>(`/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }
  const userId = currentUserId();
  const updated = updateBucketItem<Case>(BUCKET, userId, id, patch);
  return { success: true, data: updated };
}
