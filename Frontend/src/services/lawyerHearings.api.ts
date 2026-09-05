import { apiClient, USE_MOCKS } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { LAWYER_DATA_BUCKETS, type Hearing } from "@/types/lawyer";
import { appendToBucket, currentUserId, readBucket, updateBucketItem } from "@/lib/workspace-store";

export async function listHearings(): Promise<ApiResponse<Hearing[]>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const userId = currentUserId();
    return { success: true, data: readBucket<Hearing>(LAWYER_DATA_BUCKETS.hearings, userId) };
  }

  const res = await apiClient<Hearing[]>("/lawyer/hearings");
  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  return { success: true, data: readBucket<Hearing>(LAWYER_DATA_BUCKETS.hearings, userId) };
}

export async function createHearing(input: Omit<Hearing, "id" | "createdAt">): Promise<ApiResponse<Hearing>> {
  if (USE_MOCKS) {
    const userId = currentUserId();
    if (!userId) return { success: false, data: null as unknown as Hearing, error: { code: "NO_SESSION", message: "You must be signed in." } };
    const hearing: Hearing = { ...input, id: `hearing-${crypto.randomUUID()}`, createdAt: new Date().toISOString() };
    appendToBucket<Hearing>(LAWYER_DATA_BUCKETS.hearings, userId, hearing, 500);
    return { success: true, data: hearing };
  }

  const res = await apiClient<Hearing>("/lawyer/hearings", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  const fallback: Hearing = { ...input, id: `hearing-${Date.now()}`, createdAt: new Date().toISOString() };
  if (userId) appendToBucket<Hearing>(LAWYER_DATA_BUCKETS.hearings, userId, fallback, 500);
  return { success: true, data: fallback };
}

export async function updateHearing(id: string, patch: Partial<Hearing>): Promise<ApiResponse<Hearing[]>> {
  if (!USE_MOCKS) {
    await apiClient<Hearing>(`/lawyer/hearings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }
  const userId = currentUserId();
  const updated = updateBucketItem<Hearing>(LAWYER_DATA_BUCKETS.hearings, userId, id, patch);
  return { success: true, data: updated };
}
