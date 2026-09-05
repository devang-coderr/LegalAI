"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden";

    const variantStyles = {
      primary:
        "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm hover:opacity-90 focus:ring-[var(--accent-gold)] border border-[var(--text-primary)]",
      secondary:
        "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-gold)] hover:bg-[var(--bg-secondary)] shadow-sm focus:ring-[var(--accent-gold)]",
      outline:
        "border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold-light)] focus:ring-[var(--accent-gold)]",
      gold:
        "bg-[var(--accent-gold)] text-white shadow-sm hover:opacity-90 focus:ring-[var(--accent-gold)] border border-[var(--accent-gold)] font-serif",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:ring-gray-400",
      danger:
        "bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700 focus:ring-rose-500 border border-rose-400/30",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-medium gap-1.5",
      md: "px-4 py-2.5 text-sm font-medium gap-2",
      lg: "px-6 py-3.5 text-base font-semibold gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ translateY: -1.5 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:translate-x-1">
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
