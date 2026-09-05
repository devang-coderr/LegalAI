import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "gold" | "violet" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "blue",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300",
    gold: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 font-serif",
    violet: "bg-purple-500/10 text-purple-400 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-md border",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg border",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
