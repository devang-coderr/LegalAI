"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CinematicBackgroundProps = {
  variant?: "hero" | "workspace" | "dawn";
  className?: string;
};

/** A deliberately quiet visual layer: video is optional, muted, and removed for reduced motion. */
export function CinematicBackground({ variant = "workspace", className }: CinematicBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // "hero" no longer plays its own video — HeroSceneRotator owns the hero's primary visual
  // (crossfading photo scenes). This layer just supplies the quiet gold wash + column motif
  // underneath it, so we don't load two heavy video sources into the same viewport.
  const video = variant === "dawn" ? "/cinematic/court-dawn.mp4" : undefined;

  return (
    <div
      aria-hidden
      className={cn(
        "cinematic-background",
        `cinematic-${variant}`,
        variant === "hero" && "hero-variant",
        className
      )}
    >
      {video && !reducedMotion && (
        <video autoPlay loop muted playsInline preload="metadata" poster="/cinematic/supreme-court.jpeg">
          <source src={video} type="video/mp4" />
        </video>
      )}
      <div className="cinematic-image" />
      <div className="cinematic-wash" />
      <div className="cinematic-columns" />
    </div>
  );
}
