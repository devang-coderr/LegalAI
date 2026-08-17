"use client";

import { motion } from "framer-motion";

/**
 * An abstracted, sculptural rendering of Lady Justice: a draped monolithic
 * silhouette suggesting a robed figure, crowned by a slowly balancing scale.
 * Intentionally non-literal — closer to a museum sculpture lit from behind
 * than a stock illustration.
 */
export function LadyJustice() {
  return (
    <div className="relative mx-auto h-[62vh] w-full max-w-md" aria-hidden="true">
      <svg
        viewBox="0 0 400 620"
        fill="none"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="figureFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.55" />
            <stop offset="55%" stopColor="var(--ink)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="haloGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="var(--azure)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--azure)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo */}
        <circle cx="200" cy="170" r="200" fill="url(#haloGlow)" />

        {/* draped monolithic silhouette */}
        <motion.path
          d="M200 120
             C 165 120 150 150 148 190
             C 145 260 120 320 110 400
             C 100 470 95 520 95 580
             L 305 580
             C 305 520 300 470 290 400
             C 280 320 255 260 252 190
             C 250 150 235 120 200 120 Z"
          fill="url(#figureFade)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* head hint */}
        <motion.circle
          cx="200"
          cy="96"
          r="30"
          fill="var(--ink)"
          fillOpacity="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* raised arm suggestion */}
        <motion.path
          d="M240 150 C 270 130 285 95 282 55"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* scale beam, gently balancing */}
        <motion.g
          style={{ transformOrigin: "282px 55px" }}
          animate={{ rotate: [-3.5, 3.5, -3.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1="232" y1="55" x2="332" y2="55" stroke="var(--gold)" strokeWidth="2.5" strokeOpacity="0.8" />
          <line x1="232" y1="55" x2="232" y2="82" stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="332" y1="55" x2="332" y2="82" stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M220 82 A 12 12 0 0 0 244 82" stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
          <path d="M320 82 A 12 12 0 0 0 344 82" stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
          <circle cx="282" cy="55" r="4" fill="var(--gold)" fillOpacity="0.9" />
        </motion.g>
      </svg>

      {/* soft ground glow */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--azure-soft)] to-transparent blur-2xl" />
    </div>
  );
}
