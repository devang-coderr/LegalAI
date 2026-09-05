"use client";

import React, { useEffect, useRef } from "react";

interface StarFieldProps {
  density?: number; // base particle count on desktop
  goldRatio?: number; // fraction of particles rendered in gold accent
  className?: string;
}

/**
 * Extremely light canvas particle field used behind the 3D story, phone showcase
 * and other cinematic sections. Not a literal starfield — density and drift are
 * tuned to read as "legal knowledge floating through dark information space"
 * rather than a space wallpaper. Automatically thins out on mobile and disables
 * drift entirely under prefers-reduced-motion.
 */
export function StarField({ density = 90, goldRatio = 0.12, className = "" }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    const count = Math.round(density * (isMobile ? 0.45 : 1));

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = { x: number; y: number; r: number; vy: number; vx: number; a: number; gold: boolean };
    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        vy: (Math.random() * 0.12 + 0.02) * (reducedMotion ? 0 : 1),
        vx: (Math.random() - 0.5) * (reducedMotion ? 0 : 0.05),
        a: Math.random() * 0.5 + 0.2,
        gold: Math.random() < goldRatio,
      }));
    };

    resize();
    seed();

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(221,177,93,${p.a})` : `rgba(245,241,232,${p.a * 0.55})`;
        ctx.fill();
        if (!reducedMotion) {
          p.y -= p.vy;
          p.x += p.vx;
          if (p.y < -4) p.y = height + 4;
          if (p.x < -4) p.x = width + 4;
          if (p.x > width + 4) p.x = -4;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density, goldRatio]);

  return (
    <div className={`lp-starfield ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
