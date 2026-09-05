"use client";

import { useCallback, useEffect, useState } from "react";
import type { Client } from "@/types/lawyer";
import { createClient, listClients } from "@/services/lawyerClients.api";

export function useLawyerClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const response = await listClients();
    setIsLoading(false);
    if (response.success) setClients(response.data);
    else setError(response.error?.message || "Unable to load clients.");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- genuinely async fetch-on-mount
    load();
  }, [load]);

  const addClient = useCallback(async (input: Omit<Client, "id" | "createdAt" | "source">) => {
    const response = await createClient(input);
    if (response.success) setClients((prev) => [response.data, ...prev]);
    return response;
  }, []);

  return { clients, isLoading, error, reload: load, addClient };
}
