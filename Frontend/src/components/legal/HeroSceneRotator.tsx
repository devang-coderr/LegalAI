"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroScene = {
  image: string;
  /** Focal position for object-position, tuned per photo so key subject stays in frame on mobile crops. */
  focus?: string;
  eyebrow?: string;
  heading: string;
  subheading: string;
  supportingText: string;
};

const SCENES: HeroScene[] = [
  {
    image: "/cinematic/scene-1-courthouse.jpeg",
    focus: "center 35%",
    heading: "Legal intelligence for",
    subheading: "better decisions.",
    supportingText:
      "Search cases, understand legal documents, discover precedents and make informed legal decisions with AI.",
  },
  {
    image: "/cinematic/scene-2-digital-court.jpeg",
    focus: "center 55%",
    heading: "Understand the law",
    subheading: "faster.",
    supportingText:
      "AI-powered analysis turns complex legal information into clear, useful insight — built for the modern courtroom.",
  },
  {
    image: "/cinematic/scene-3-ai-research.jpeg",
    focus: "center 40%",
    heading: "Find the precedent",
    subheading: "that matters.",
    supportingText:
      "Search and analyze relevant cases, judgments and legal documents in seconds, not weeks.",
  },
  {
    image: "/cinematic/scene-4-dawn.jpeg",
    focus: "center 60%",
    heading: "From information to",
    subheading: "legal insight.",
    supportingText:
      "Connect cases, laws and precedents through intelligent legal research that never sleeps.",
  },
];

const SCENE_DURATION_MS = 5000;
const CROSSFADE_S = 1;
const HERO_VIDEO = "/img-video-Resources/legalai-hero.mp4"; // Contained hero video background

export { SCENES };

/**
 * Contained hero visual: crossfading photo scenes with a slow Ken-Burns drift and
 * rotating headline copy. Pauses on hover/focus, when the tab is hidden, or when the
 * user prefers reduced motion — in which case it freezes on the first scene.
 */
export function HeroSceneRotator({
  className,
  onSceneChange,
}: {
  className?: string;
  onSceneChange?: (scene: HeroScene, index: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENES.length);
    }, SCENE_DURATION_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, paused]);

  useEffect(() => {
    onSceneChange?.(SCENES[index], index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Video (optional, plays behind images) */}
      {!reducedMotion && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-scene-video absolute inset-0 w-full h-full object-cover opacity-20"
          poster="/cinematic/supreme-court.jpeg"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}

      <AnimatePresence initial={false}>
        <motion.div
          key={SCENES[index].image}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_S, ease: "easeInOut" }}
        >
          <motion.img
            src={SCENES[index].image}
            alt=""
            aria-hidden
            loading={index === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover"
            style={{ objectPosition: SCENES[index].focus ?? "center" }}
            initial={{ scale: 1 }}
            animate={reducedMotion ? { scale: 1 } : { scale: 1.06 }}
            transition={{ duration: (SCENE_DURATION_MS + CROSSFADE_S * 1000) / 1000, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Readability overlay — VERY LIGHT so photos are highly visible. 
          Only darkens at the BOTTOM where text sits. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />

      {/* Scene indicator dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {SCENES.map((scene, i) => (
          <button
            key={scene.image}
            type="button"
            aria-label={`Show scene ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === index ? "w-6 bg-white/90" : "w-1.5 bg-white/35 hover:bg-white/55"
            )}
          />
        ))}
      </div>
    </div>
  );
}
