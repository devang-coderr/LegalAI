"use client";

import React from "react";

export function LadyJusticeArt() {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center pointer-events-none">
      {/* Background Volumetric Glow Ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-amber-500/10 blur-3xl animate-pulse" />

      {/* SVG Lady Justice Visual Silhouette Motif */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_35px_rgba(59,130,246,0.3)]"
      >
        {/* Supreme Court Architectural Pillar Base */}
        <path
          d="M120 360 L280 360 L270 380 L130 380 Z"
          fill="url(#goldGradient)"
          opacity="0.8"
        />
        <rect x="140" y="340" width="120" height="20" fill="url(#blueGradient)" opacity="0.6" />

        {/* Central Lady Justice Statue Column & Silhouette Body */}
        <path
          d="M200 80 Q215 120 210 180 Q225 240 215 340 L185 340 Q175 240 190 180 Q185 120 200 80 Z"
          fill="url(#bodyGradient)"
        />

        {/* Sword of Truth & Justice */}
        <line x1="200" y1="90" x2="200" y2="330" stroke="url(#goldGradient)" strokeWidth="3" />
        <path d="M185 120 L215 120" stroke="url(#goldGradient)" strokeWidth="4" />

        {/* Animated Scales of Justice */}
        <g className="animate-[bounce_6s_easeInOut_infinite]">
          {/* Main Horizontal Balance Bar */}
          <line x1="100" y1="130" x2="300" y2="130" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="200" cy="130" r="7" fill="#f59e0b" />

          {/* Left Scale Pan */}
          <line x1="100" y1="130" x2="80" y2="190" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5" />
          <line x1="100" y1="130" x2="120" y2="190" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5" />
          <path d="M70 190 Q100 215 130 190 Z" fill="url(#scalePanGradient)" />
          <circle cx="100" cy="180" r="3" fill="#60a5fa" />

          {/* Right Scale Pan */}
          <line x1="300" y1="130" x2="280" y2="190" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5" />
          <line x1="300" y1="130" x2="320" y2="190" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="1.5" />
          <path d="M270 190 Q300 215 330 190 Z" fill="url(#scalePanGradient)" />
          <circle cx="300" cy="180" r="3" fill="#60a5fa" />
        </g>

        {/* Blindfold & Crown of Wisdom */}
        <circle cx="200" cy="70" r="18" fill="url(#goldGradient)" />
        <rect x="186" y="66" width="28" height="8" rx="4" fill="#0b0f19" />

        {/* Gradients */}
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="blueGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(248, 250, 252, 0.9)" />
            <stop offset="0.5" stopColor="rgba(147, 197, 253, 0.4)" />
            <stop offset="1" stopColor="rgba(15, 23, 42, 0.8)" />
          </linearGradient>

          <linearGradient id="scalePanGradient" x1="0" y1="0" x2="0" y2="1" gradientUnits="boundingBox">
            <stop stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="1" stopColor="rgba(245, 158, 11, 0.3)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
