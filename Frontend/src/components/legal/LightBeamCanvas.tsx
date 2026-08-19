"use client";

import React, { useEffect, useRef } from "react";

export function LightBeamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for subtle beam shift
    let mouseX = width / 2;
    let targetMouseX = width / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Particle setup
    const isMobile = width < 768;
    const particleCount = prefersReducedMotion ? 0 : isMobile ? 25 : 55;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: 0,
      maxOpacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.03;

      ctx.clearRect(0, 0, width, height);

      // Draw Volumetric Vertical Light Shaft
      const beamCenterX = mouseX;
      const topWidth = width * 0.15;
      const bottomWidth = width * 0.45;

      const beamGradient = ctx.createLinearGradient(0, 0, 0, height);
      beamGradient.addColorStop(0, "rgba(59, 130, 246, 0.18)");
      beamGradient.addColorStop(0.4, "rgba(139, 92, 246, 0.12)");
      beamGradient.addColorStop(0.8, "rgba(245, 158, 11, 0.04)");
      beamGradient.addColorStop(1, "rgba(5, 8, 20, 0)");

      ctx.beginPath();
      ctx.moveTo(beamCenterX - topWidth / 2, 0);
      ctx.lineTo(beamCenterX + topWidth / 2, 0);
      ctx.lineTo(beamCenterX + bottomWidth / 2, height);
      ctx.lineTo(beamCenterX - bottomWidth / 2, height);
      ctx.closePath();

      ctx.fillStyle = beamGradient;
      ctx.fill();

      // Render Floating Dust & Light Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset particle on top exit
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        // Fade in / out near boundaries
        if (p.y > height - 100) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.01);
        } else if (p.y < 100) {
          p.opacity = Math.max(0, p.opacity - 0.01);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full opacity-90 transition-opacity duration-1000"
    />
  );
}
