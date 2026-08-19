import React from "react";
import { FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "There are no records to display at this moment.",
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl glass-panel border border-[var(--border-color)] bg-[var(--bg-card)]/50 my-4",
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] font-serif">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load data",
  description = "An error occurred while connecting to the legal intelligence service. Please check your network or try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 my-4",
        className
      )}
    >
      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 mb-3">
        <RefreshCw className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-300 font-serif">{title}</h3>
      <p className="mt-1 text-xs text-rose-300/80 max-w-sm">{description}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
}
