"use client";

import { useCallback, useEffect, useState } from "react";
import type { Case } from "@/types/case";
import { listMyCases } from "@/services/citizenCases.api";

export function useMyCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await listMyCases();
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

  return { cases, isLoading, error, reload: load };
}
