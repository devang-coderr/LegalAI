"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResearchNote } from "@/types/lawyer";
import { createResearchNote, deleteResearchNote, listResearchNotes, updateResearchNote } from "@/services/lawyerResearchNotes.api";

export function useResearchNotes(clientId?: string) {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const response = await listResearchNotes();
    setIsLoading(false);
    if (response.success) setNotes(response.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- genuinely async fetch-on-mount
    load();
  }, [load]);

  const addNote = useCallback(async (title: string, content: string) => {
    if (!clientId) return;
    const response = await createResearchNote(clientId, title, content);
    if (response.success) setNotes((prev) => [response.data, ...prev]);
  }, [clientId]);

  const editNote = useCallback(async (id: string, title: string, content: string) => {
    const response = await updateResearchNote(id, { title, content });
    if (response.success) setNotes(response.data);
  }, []);

  const removeNote = useCallback(async (id: string) => {
    const response = await deleteResearchNote(id);
    if (response.success) setNotes(response.data);
  }, []);

  const scoped = clientId ? notes.filter((n) => n.clientId === clientId) : notes;

  return { notes: scoped, isLoading, addNote, editNote, removeNote };
}
