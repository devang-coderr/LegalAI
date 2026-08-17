"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CitationCard } from "@/components/legal/CitationCard";
import { MOCK_RESEARCH_ANSWER } from "@/mocks/legalResearch";

const QUICK_PROMPTS = [
  "Explain this in simple language",
  "Show relevant judgments",
  "What documents do I need?",
  "What should I do next?",
];

export function LegalResearchPanel() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "answered">("idle");

  function handleAsk(q?: string) {
    const finalQuery = q ?? query;
    if (!finalQuery.trim()) return;
    setQuery(finalQuery);
    setStatus("loading");
    setTimeout(() => setStatus("answered"), 1100);
  }

  return (
    <div className="space-y-6">
      <Card glow={false}>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[var(--ink-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask a legal research question…"
            className="flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || status === "loading"}
            className="rounded-full bg-[var(--azure)] px-4 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
          >
            Ask
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleAsk(p)}
              className="rounded-full border border-[var(--surface-border)] px-3 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--azure)]/40 hover:text-[var(--ink)]"
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-[var(--ink-muted)]"
          >
            <Loader2 className="h-4 w-4 animate-spin text-[var(--azure)]" />
            Searching relevant law and precedents…
          </motion.div>
        )}

        {status === "answered" && (
          <motion.div
            key="answered"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <Card glow={false}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[var(--azure)]">
                  <Sparkles className="h-3.5 w-3.5" /> LegalAI Answer
                </span>
                <span className="rounded-full bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--gold)]">
                  Demo Data
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ink)]">
                {MOCK_RESEARCH_ANSWER.answer}
              </p>
            </Card>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                Sources & Related Cases
              </p>
              <div className="space-y-3">
                {MOCK_RESEARCH_ANSWER.citations.map((c) => (
                  <CitationCard key={c.id} precedent={c} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
