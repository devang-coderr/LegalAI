"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Case } from "@/types/case";
import { createLawyerCase, listLawyerCases, updateLawyerCase } from "@/services/lawyerCases.api";

export function useLawyerCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await listLawyerCases();
    setIsLoading(false);
    if (response.success) {
      setCases(response.data);
    } else {
      setError(response.error?.message || "Unable to load cases.");
    }
  }, []);

  useEffect(() => {
    // Genuinely async fetch-on-mount (simulated network latency); there is
    // no synchronous alternative here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const addCase = useCallback(async (input: Omit<Case, "id">) => {
    const response = await createLawyerCase(input);
    if (response.success) setCases((prev) => [response.data, ...prev]);
    return response;
  }, []);

  const patchCase = useCallback(async (id: string, patch: Partial<Case>) => {
    const response = await updateLawyerCase(id, patch);
    if (response.success) setCases(response.data);
    return response;
  }, []);

  const activeCases = useMemo(() => cases.filter((c) => c.status === "ACTIVE" || c.status === "UPCOMING_HEARING"), [cases]);
  const stats = useMemo(
    () => ({
      total: cases.length,
      active: cases.filter((c) => c.status === "ACTIVE" || c.status === "UPCOMING_HEARING").length,
      settled: cases.filter((c) => c.status === "SETTLED").length,
      closed: cases.filter((c) => c.status === "CLOSED").length,
    }),
    [cases]
  );

  return { cases, activeCases, stats, isLoading, error, reload: load, addCase, patchCase };
}
