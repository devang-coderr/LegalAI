"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Search, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { HeroSceneRotator, SCENES, type HeroScene } from "@/components/legal/HeroSceneRotator";
import { CinematicBackground } from "@/components/layout/CinematicBackground";

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScene, setActiveScene] = useState<HeroScene>(SCENES[0]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/citizen/case-intelligence?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] mx-3 sm:mx-6 lg:mx-8 mt-24 min-h-[82vh] flex items-end">
      {/* Quiet gold wash + column motif, sits under the photo scenes */}
      <CinematicBackground variant="hero" className="rounded-[2.5rem]" />
      {/* Crossfading photo scenes with Ken-Burns drift + built-in readability overlay */}
      <HeroSceneRotator onSceneChange={(scene) => setActiveScene(scene)} />

      <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 pb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-md text-xs font-semibold text-white shadow-lg mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AI-Powered Legal Intelligence</span>
        </motion.div>

        {/* Rotating headline — crossfades with each hero scene, ~600ms, no bounce */}
        <div className="space-y-2 min-h-[6.5rem] sm:min-h-[8.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-white leading-[1.15] drop-shadow-md">
                {activeScene.heading}
              </h1>
              <h2 className="text-3xl sm:text-5xl font-normal tracking-tight font-serif italic text-amber-300 drop-shadow-md">
                {activeScene.subheading}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="min-h-[3.5rem] max-w-2xl mt-4 mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeScene.supportingText}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="text-base sm:text-lg text-white/85 leading-relaxed font-sans"
            >
              {activeScene.supportingText}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Interactive Quick Legal Search Input — static, not tied to scene rotation */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          onSubmit={handleHeroSearch}
          className="relative max-w-xl"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-amber-200/80 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe your legal issue (e.g., Property dispute regarding ancestral land title)..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/12 backdrop-blur-md border border-white/25 text-sm text-white placeholder-white/60 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30 shadow-xl transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-2 text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Ask LegalAI
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2.5 px-2 text-[11px] text-white/70">
            <span>Try: &quot;Tenant eviction notice response&quot;</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Shield className="w-3 h-3" /> Encrypted & Private
            </span>
          </div>
        </motion.form>

        {/* Hero Action Buttons — static, not tied to scene rotation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 pt-6"
        >
          <a href="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore LegalAI
            </Button>
          </a>

          <a href="#how-it-works">
            <Button
              variant="secondary"
              size="lg"
              className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Extremely subtle scroll cue */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="hidden sm:flex absolute bottom-6 right-8 z-10 items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white/50"
        aria-hidden="true"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
