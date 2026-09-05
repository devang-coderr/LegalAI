import type { BadgeProps } from "@/components/ui/Badge";

/**
 * Maps a case status string to a semantic Badge variant. Used by both
 * Citizen My Cases and Lawyer My Cases / Active Cases so status color always
 * means the same thing across the product: green = resolved, blue = moving
 * forward, amber = needs attention, red = adverse/critical, gray = unknown.
 */
export function statusToBadgeVariant(status: string | undefined | null): BadgeProps["variant"] {
  const normalized = (status || "").toLowerCase();
  if (["settled", "closed", "resolved"].some((s) => normalized.includes(s))) return "success";
  if (["active", "in progress", "in-progress", "ongoing"].some((s) => normalized.includes(s))) return "blue";
  if (["pending", "awaiting", "notice reply", "reply due"].some((s) => normalized.includes(s))) return "warning";
  if (["critical", "adverse", "urgent", "risk"].some((s) => normalized.includes(s))) return "danger";
  return "neutral";
}
