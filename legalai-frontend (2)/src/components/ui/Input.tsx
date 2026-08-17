"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="text-left">
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-2)]/70 px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all duration-300 placeholder:text-[var(--ink-faint)]",
            "focus:border-[var(--azure)]/60 focus:shadow-[var(--shadow-glow-azure)]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
