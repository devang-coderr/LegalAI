"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 p-1.5 rounded-xl glass-panel bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] overflow-x-auto max-w-full",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none",
              isActive
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-lg bg-[var(--bg-card)] shadow-md border border-[var(--border-color)]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-semibold rounded-md",
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-slate-500/20 text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
