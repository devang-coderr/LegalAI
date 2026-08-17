"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, children, glow = true, ...props }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      className={cn(
        "group relative rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-2)]/70 p-6 backdrop-blur-sm",
        "transition-transform duration-500 ease-[var(--ease-signature)] hover:-translate-y-1",
        "shadow-[var(--shadow-elevated)]",
        className
      )}
      style={
        glow
          ? ({
              "--mx": `${pos.x}%`,
              "--my": `${pos.y}%`,
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx) var(--my), var(--azure-soft), transparent 70%)",
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(140, 160, 220, 0.35)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
