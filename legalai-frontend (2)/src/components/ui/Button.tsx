"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type SharedProps = {
  variant?: "primary" | "ghost";
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function classesFor(variant: "primary" | "ghost", className?: string) {
  if (variant === "ghost") {
    return cn(
      "group relative inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition-all duration-300",
      "hover:border-[var(--azure)]/50 hover:bg-[var(--azure-soft)]",
      className
    );
  }
  return cn(
    "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-[#05070d] transition-all duration-300",
    "bg-gradient-to-b from-[#eef2ff] to-[#c9d4f5]",
    "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_10px_30px_-10px_rgba(91,127,232,0.55)]",
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_14px_36px_-8px_rgba(91,127,232,0.7)] hover:-translate-y-0.5",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--azure)] focus-visible:outline-offset-2",
    className
  );
}

function ButtonContent({
  variant,
  showArrow,
  children,
}: {
  variant: "primary" | "ghost";
  showArrow?: boolean;
  children: React.ReactNode;
}) {
  if (variant === "ghost") {
    return (
      <>
        {children}
        {showArrow && (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </>
    );
  }
  return (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      {showArrow && (
        <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", showArrow = false, className, children } = props;

  if ("href" in props && props.href) {
    const { href, variant: _v, showArrow: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classesFor(variant, className)} {...rest}>
        <ButtonContent variant={variant} showArrow={showArrow}>
          {children}
        </ButtonContent>
      </Link>
    );
  }

  const { href: _href, variant: _v2, showArrow: _s2, className: _c2, children: _ch2, ...rest } =
    props as ButtonProps;
  return (
    <button className={classesFor(variant, className)} {...rest}>
      <ButtonContent variant={variant} showArrow={showArrow}>
        {children}
      </ButtonContent>
    </button>
  );
}
