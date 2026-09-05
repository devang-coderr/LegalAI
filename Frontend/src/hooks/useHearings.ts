"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hearing } from "@/types/lawyer";
import { createHearing, listHearings, updateHearing } from "@/services/lawyerHearings.api";
import { updateLawyerCase } from "@/services/lawyerCases.api";

export function useHearings() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const response = await listHearings();
    setIsLoading(false);
    if (response.success) setHearings(response.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- genuinely async fetch-on-mount
    load();
  }, [load]);

  const addHearing = useCallback(async (input: Omit<Hearing, "id" | "createdAt">) => {
    const response = await createHearing(input);
    if (response.success) {
      setHearings((prev) => [response.data, ...prev]);
      // Keep the case's "next hearing" field in sync for My Cases / Client Profile.
      await updateLawyerCase(input.caseId, { nextHearingDate: `${input.date} ${input.time}`, status: "UPCOMING_HEARING" });
    }
    return response;
  }, []);

  const patchHearing = useCallback(async (id: string, patch: Partial<Hearing>) => {
    const response = await updateHearing(id, patch);
    if (response.success) setHearings(response.data);
    return response;
  }, []);

  // eslint-disable-next-line react-hooks/purity -- read-only snapshot used only to bucket hearings into upcoming/past for this render; no side effects.
  const now = Date.now();
  const upcoming = useMemo(
    () => hearings.filter((h) => h.status === "SCHEDULED" && new Date(`${h.date}T${h.time || "00:00"}`).getTime() >= now)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [hearings, now]
  );
  const past = useMemo(
    () => hearings.filter((h) => h.status !== "SCHEDULED" || new Date(`${h.date}T${h.time || "00:00"}`).getTime() < now)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [hearings, now]
  );

  const hearingsForCase = useCallback((caseId: string) => hearings.filter((h) => h.caseId === caseId).sort((a, b) => b.date.localeCompare(a.date)), [hearings]);

  return { hearings, upcoming, past, isLoading, addHearing, patchHearing, hearingsForCase, reload: load };
}
