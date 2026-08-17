"use client";

import { motion } from "framer-motion";
import { Check, Circle, Clock } from "lucide-react";
import type { TimelineEvent } from "@/types/case";
import { cn } from "@/lib/utils";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--surface-border)]" />
      <div className="space-y-8">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="relative flex gap-4 pl-0"
          >
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                event.status === "completed"
                  ? "border-[var(--azure)] bg-[var(--azure)] text-white"
                  : event.status === "upcoming"
                  ? "border-[var(--azure)] bg-[var(--surface-2)] text-[var(--azure)]"
                  : "border-[var(--surface-border)] bg-[var(--surface-2)] text-[var(--ink-faint)]"
              )}
            >
              {event.status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : event.status === "upcoming" ? (
                <Clock className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </span>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">
                  {event.title}
                </h3>
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-faint)]">
                  {event.date}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
