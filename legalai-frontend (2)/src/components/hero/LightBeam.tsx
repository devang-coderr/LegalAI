"use client";

import { useEffect, useRef } from "react";

export function LightBeam() {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let targetX = 0;
    let currentX = 0;

    function onMove(e: MouseEvent) {
      const ratio = e.clientX / window.innerWidth - 0.5; // -0.5 to 0.5
      targetX = ratio * 28; // max px shift, kept subtle
    }

    function animate() {
      currentX += (targetX - currentX) * 0.04;
      if (beamRef.current) {
        beamRef.current.style.transform = `translateX(calc(-50% + ${currentX}px)) skewX(${
          currentX * 0.15
        }deg)`;
      }
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMove);
    animate();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={beamRef}
      aria-hidden="true"
      className="signature-beam pointer-events-none absolute left-1/2 top-0 h-full w-[540px] -translate-x-1/2 blur-2xl"
      style={{ willChange: "transform" }}
    />
  );
}
