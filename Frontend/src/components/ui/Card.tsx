"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "glass" | "solid" | "parchment" | "bordered";
  hoverable?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = "glass",
  hoverable = true,
  className,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    glass: "glass-card rounded-2xl p-6 relative overflow-hidden",
    solid: "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm",
    parchment: "legal-parchment rounded-2xl p-6 relative overflow-hidden",
    bordered: "border-2 border-[var(--accent-blue-glow)] bg-[var(--bg-card)] rounded-2xl p-6",
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(variantStyles[variant], hoverable && "cursor-pointer", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
