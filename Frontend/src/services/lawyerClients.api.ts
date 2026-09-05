import { apiClient, USE_MOCKS } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { LAWYER_DATA_BUCKETS, type Client } from "@/types/lawyer";
import { appendToBucket, currentUserId, readBucket } from "@/lib/workspace-store";

export async function listClients(): Promise<ApiResponse<Client[]>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const userId = currentUserId();
    if (!userId) {
      return { success: false, data: [], error: { code: "NO_SESSION", message: "You must be signed in to view clients." } };
    }
    return { success: true, data: readBucket<Client>(LAWYER_DATA_BUCKETS.clients, userId) };
  }

  const res = await apiClient<Client[]>("/lawyer/clients");
  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  return { success: true, data: userId ? readBucket<Client>(LAWYER_DATA_BUCKETS.clients, userId) : [] };
}

export async function createClient(input: Omit<Client, "id" | "createdAt" | "source">): Promise<ApiResponse<Client>> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const userId = currentUserId();
    if (!userId) {
      return { success: false, data: null as unknown as Client, error: { code: "NO_SESSION", message: "You must be signed in." } };
    }
    const client: Client = { ...input, id: `client-${crypto.randomUUID()}`, createdAt: new Date().toISOString(), source: "MANUAL" };
    appendToBucket<Client>(LAWYER_DATA_BUCKETS.clients, userId, client, 500);
    return { success: true, data: client };
  }

  const res = await apiClient<Client>("/lawyer/clients", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (res.success && res.data) {
    return res;
  }

  const userId = currentUserId();
  const fallback: Client = { ...input, id: `client-${Date.now()}`, createdAt: new Date().toISOString(), source: "MANUAL" };
  if (userId) appendToBucket<Client>(LAWYER_DATA_BUCKETS.clients, userId, fallback, 500);
  return { success: true, data: fallback };
}
