import React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LegalDisclaimerProps {
  className?: string;
  variant?: "compact" | "banner";
}

export function LegalDisclaimer({
  className,
  variant = "compact",
}: LegalDisclaimerProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs leading-relaxed",
          className
        )}
      >
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <p>
          <strong className="font-semibold">Legal Disclaimer:</strong> LegalAI provides AI-assisted legal information and research support and does not replace professional legal advice or advocate representation.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs sm:text-sm leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
          <ShieldAlert className="w-5 h-5 shrink-0" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-800 dark:text-amber-200">Legal Intelligence Advisory</h4>
          <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
            LegalAI provides AI-assisted legal information, section mapping, and research support. It does not constitute formal legal counsel or advocate representation under the Advocates Act.
          </p>
        </div>
      </div>
    </div>
  );
}
