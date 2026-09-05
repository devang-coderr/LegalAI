import { apiClient, USE_MOCKS } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { LAWYER_DATA_BUCKETS, type ResearchNote } from "@/types/lawyer";
import { appendToBucket, currentUserId, readBucket, removeFromBucket, updateBucketItem } from "@/lib/workspace-store";

export async function listResearchNotes(): Promise<ApiResponse<ResearchNote[]>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const userId = currentUserId();
    return { success: true, data: readBucket<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId) };
  }

  const res = await apiClient<ResearchNote[]>("/lawyer/notes");
  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  return { success: true, data: readBucket<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId) };
}

export async function createResearchNote(clientId: string, title: string, content: string): Promise<ApiResponse<ResearchNote>> {
  if (USE_MOCKS) {
    const userId = currentUserId();
    if (!userId) return { success: false, data: null as unknown as ResearchNote, error: { code: "NO_SESSION", message: "You must be signed in." } };
    const note: ResearchNote = { id: `note-${crypto.randomUUID()}`, clientId, title, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    appendToBucket<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId, note, 500);
    return { success: true, data: note };
  }

  const res = await apiClient<ResearchNote>("/lawyer/notes", {
    method: "POST",
    body: JSON.stringify({ clientId, title, content }),
  });

  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  const fallback: ResearchNote = { id: `note-${Date.now()}`, clientId, title, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (userId) appendToBucket<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId, fallback, 500);
  return { success: true, data: fallback };
}

export async function updateResearchNote(id: string, patch: Partial<Pick<ResearchNote, "title" | "content">>): Promise<ApiResponse<ResearchNote[]>> {
  if (!USE_MOCKS) {
    await apiClient<ResearchNote>(`/lawyer/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }
  const userId = currentUserId();
  const updated = updateBucketItem<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId, id, { ...patch, updatedAt: new Date().toISOString() });
  return { success: true, data: updated };
}

export async function deleteResearchNote(id: string): Promise<ApiResponse<ResearchNote[]>> {
  if (!USE_MOCKS) {
    await apiClient<Record<string, unknown>>(`/lawyer/notes/${id}`, {
      method: "DELETE",
    });
  }
  const userId = currentUserId();
  const updated = removeFromBucket<ResearchNote>(LAWYER_DATA_BUCKETS.researchNotes, userId, id);
  return { success: true, data: updated };
}
