import { apiClient, USE_MOCKS } from "@/lib/api-client";
import { currentUserId, readBucket } from "@/lib/workspace-store";
import type { ApiResponse } from "@/types/api";
import type { Case } from "@/types/case";

const BUCKET = "citizen-cases";

export async function listMyCases(): Promise<ApiResponse<Case[]>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const userId = currentUserId();
    if (!userId) {
      return { success: false, data: [], error: { code: "NO_SESSION", message: "You must be signed in to view your cases." } };
    }
    return { success: true, data: readBucket<Case>(BUCKET, userId) };
  }

  const res = await apiClient<Case[]>("/citizen/cases");
  if (res.success && res.data) {
    return res;
  }

  // Fallback to local store
  const userId = currentUserId();
  return { success: true, data: userId ? readBucket<Case>(BUCKET, userId) : [] };
}
