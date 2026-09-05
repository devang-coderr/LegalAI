"use client";

/**
 * LegalAI currently has no live backend — `USE_MOCKS` in `lib/api-client.ts`
 * is effectively always on. Per-page hardcoded demo arrays made every new
 * account look pre-populated with the same fake cases/documents/searches.
 *
 * This module replaces those hardcoded arrays with a tiny per-user
 * localStorage-backed store. It behaves like a real API in shape (get/set,
 * scoped to the signed-in user, async-friendly) so swapping in real HTTP
 * calls later only means changing the service functions that call it, not
 * the hooks/components that consume them. A brand new user id has no key in
 * localStorage yet, so every list naturally starts empty — which is the
 * correct, honest state for a user who hasn't done anything yet.
 */

import { getSession } from "@/lib/auth";

function namespacedKey(bucket: string, userId: string) {
  return `legalai:${bucket}:${userId}`;
}

export function currentUserId(): string | null {
  return getSession()?.id ?? null;
}

export function readBucket<T>(bucket: string, userId: string | null): T[] {
  if (!userId || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(namespacedKey(bucket, userId));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeBucket<T>(bucket: string, userId: string | null, items: T[]): void {
  if (!userId || typeof window === "undefined") return;
  localStorage.setItem(namespacedKey(bucket, userId), JSON.stringify(items));
}

export function appendToBucket<T>(bucket: string, userId: string | null, item: T, max = 50): T[] {
  const items = [item, ...readBucket<T>(bucket, userId)].slice(0, max);
  writeBucket(bucket, userId, items);
  return items;
}

export function removeFromBucket<T extends { id: string }>(
  bucket: string,
  userId: string | null,
  id: string
): T[] {
  const items = readBucket<T>(bucket, userId).filter((item) => item.id !== id);
  writeBucket(bucket, userId, items);
  return items;
}

export function updateBucketItem<T extends { id: string }>(
  bucket: string,
  userId: string | null,
  id: string,
  patch: Partial<T>
): T[] {
  const items = readBucket<T>(bucket, userId).map((item) => (item.id === id ? { ...item, ...patch } : item));
  writeBucket(bucket, userId, items);
  return items;
}
