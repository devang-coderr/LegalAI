import type { ApiResponse } from "@/types/api";
import type { LawyerMatchRequest, MatchedLawyer } from "@/types/lawyerMatch";
import { appendToBucket, currentUserId, readBucket, updateBucketItem, writeBucket } from "@/lib/workspace-store";
import { LAWYER_BUCKETS, type ClientRequest } from "@/types/lawyerNotifications";
import { CITIZEN_BUCKETS, type SentLawyerRequest } from "@/types/citizen";
import { getSession } from "@/lib/auth";
import { apiClient, USE_MOCKS } from "@/lib/api-client";

/**
 * Searches real registered lawyers from backend database.
 */
export async function findMatchingLawyers(request: LawyerMatchRequest): Promise<ApiResponse<MatchedLawyer[]>> {
  if (!request.expertise || !request.caseDescription.trim() || !request.location.trim()) {
    return { success: false, data: [], error: { code: "VALIDATION", message: "Please complete every step before searching." } };
  }

  const res = await apiClient<MatchedLawyer[]>("/lawyers/match", {
    method: "POST",
    body: JSON.stringify({
      expertise: request.expertise,
      location: request.location,
      language: request.language || "English",
      caseDescription: request.caseDescription,
    }),
  });

  if (res.success && res.data) {
    return res;
  }

  return { success: true, data: [] };
}

/**
 * Fetches the citizen's lawyer requests from the backend API.
 */
export async function listCitizenRequests(): Promise<ApiResponse<SentLawyerRequest[]>> {
  const citizenId = currentUserId();
  if (!citizenId) {
    return { success: false, data: [], error: { code: "NO_SESSION", message: "You must be signed in to view your requests." } };
  }

  if (USE_MOCKS) {
    return { success: true, data: readBucket<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId) };
  }

  const res = await apiClient<SentLawyerRequest[]>("/citizen/lawyer-requests");
  if (res.success && res.data) {
    writeBucket(CITIZEN_BUCKETS.sentRequests, citizenId, res.data);
    return res;
  }

  return { success: true, data: readBucket<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId) };
}

/**
 * Sends a client request to a lawyer via backend API.
 */
export async function sendClientRequest(
  lawyer: MatchedLawyer,
  details: { caseType?: string; summary: string }
): Promise<ApiResponse<SentLawyerRequest>> {
  const citizen = getSession();
  const citizenId = currentUserId();
  if (!citizen || !citizenId) {
    return { success: false, data: null as unknown as SentLawyerRequest, error: { code: "NO_SESSION", message: "You must be signed in to send a request." } };
  }

  if (!USE_MOCKS) {
    const res = await apiClient<SentLawyerRequest>("/lawyers/requests", {
      method: "POST",
      body: JSON.stringify({
        lawyerId: lawyer.id,
        summary: details.summary,
        caseType: details.caseType || "General Legal Matter",
      }),
    });

    if (res.success && res.data) {
      const updated = appendToBucket<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId, res.data, 50);
      writeBucket(CITIZEN_BUCKETS.sentRequests, citizenId, updated);
      return res;
    } else {
      return res;
    }
  }

  const requestId = `req-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const lawyerSideRequest: ClientRequest = {
    id: requestId,
    lawyerId: lawyer.id,
    lawyerName: lawyer.name,
    citizenId,
    clientName: citizen.name,
    summary: details.summary,
    caseType: details.caseType,
    createdAt,
    status: "PENDING",
  };
  appendToBucket<ClientRequest>(LAWYER_BUCKETS.clientRequests, lawyer.id, lawyerSideRequest, 200);

  const citizenSideRequest: SentLawyerRequest = {
    id: requestId,
    lawyerId: lawyer.id,
    lawyerName: lawyer.name,
    caseType: details.caseType,
    summary: details.summary,
    status: "PENDING",
    createdAt,
  };
  const updated = appendToBucket<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId, citizenSideRequest, 50);
  writeBucket(CITIZEN_BUCKETS.sentRequests, citizenId, updated);

  return { success: true, data: citizenSideRequest };
}

/**
 * Cancels a pending consultation request.
 */
export async function cancelClientRequest(requestId: string): Promise<ApiResponse<SentLawyerRequest>> {
  const citizenId = currentUserId();
  if (!citizenId) {
    return { success: false, data: null as unknown as SentLawyerRequest, error: { code: "NO_SESSION", message: "You must be signed in to cancel a request." } };
  }

  if (!USE_MOCKS) {
    const res = await apiClient<SentLawyerRequest>(`/citizen/lawyer-requests/${requestId}/cancel`, {
      method: "POST",
    });

    if (res.success && res.data) {
      updateBucketItem<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId, requestId, {
        status: "CANCELLED",
        respondedAt: res.data.respondedAt || new Date().toISOString(),
      });
      return res;
    } else {
      return res;
    }
  }

  updateBucketItem<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId, requestId, {
    status: "CANCELLED",
    respondedAt: new Date().toISOString(),
  });
  const updatedList = readBucket<SentLawyerRequest>(CITIZEN_BUCKETS.sentRequests, citizenId);
  const updatedReq = updatedList.find((r) => r.id === requestId);
  return { success: true, data: updatedReq! };
}

/**
 * Updates lawyer availability ("Accepting New Requests").
 */
export async function setLawyerAvailability(isAvailable: boolean): Promise<ApiResponse<{ isAvailable: boolean }>> {
  const res = await apiClient<{ isAvailable: boolean }>("/lawyers/availability", {
    method: "PATCH",
    body: JSON.stringify({ isAvailable }),
  });
  return res;
}

/**
 * Lawyer responds to incoming consultation request (Accept / Decline).
 */
export async function respondToClientRequest(requestId: string, accept: boolean): Promise<ApiResponse<ClientRequest>> {
  if (!USE_MOCKS) {
    const res = await apiClient<ClientRequest>(`/lawyer/client-requests/${requestId}/respond`, {
      method: "POST",
      body: JSON.stringify({ accept }),
    });
    return res;
  }

  const userId = currentUserId();
  const allRequests = readBucket<ClientRequest>(LAWYER_BUCKETS.clientRequests, userId).map((r) =>
    r.id === requestId ? ({ ...r, status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date().toISOString() } as ClientRequest) : r
  );
  writeBucket(LAWYER_BUCKETS.clientRequests, userId, allRequests);
  const matched = allRequests.find((r) => r.id === requestId);
  return { success: true, data: matched! };
}

/**
 * Fetches live lawyer dashboard notifications and client requests.
 */
export async function fetchLawyerNotifications(): Promise<ApiResponse<{ notifications: unknown[]; clientRequests: ClientRequest[] }>> {
  const res = await apiClient<{ notifications: unknown[]; clientRequests: ClientRequest[] }>("/lawyer/notifications");
  return res;
}
