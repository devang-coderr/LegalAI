"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { StarField } from "@/components/landing/StarField";

/**
 * "The Legal Intelligence Archive" — a cinematic 2.5D scroll story.
 *
 * Deliberately NOT a rotating object. A world of flat document cards sits at
 * different depths (translateZ) and fixed positions; the only camera motion is
 * a forward dolly (translateZ on the whole world) plus a hair of tilt — nothing
 * orbits, nothing spins continuously. Individual cards carry a small fixed
 * rotation (2–6°) set once, for a "photographed, not generated" feel.
 *
 * The story is literal, not decorative:
 *   LAW (a few documents exist)
 *   → INFORMATION (hundreds more appear, unread)
 *   → AI (the ones that matter get flagged, one by one)
 *   → CONNECT (only the relevant documents move toward the center, threaded together)
 *   → UNDERSTAND (they resolve into the LegalAI mark + a cited answer)
 *
 * Built with layered CSS 3D transforms + SVG, scrubbed by scroll position via
 * GSAP — no WebGL, so there is nothing that can fail to load or break the page.
 */

type NamedDoc = {
  id: string;
  kind: "judgment" | "chip";
  title: string;
  meta?: string;
  x: number; // start position, in %
  y: number;
  z: number; // start depth, px
  rotate: number; // fixed tilt, deg
};

const NAMED_DOCS: NamedDoc[] = [
  { id: "judgment", kind: "judgment", title: "JUDGMENT", meta: "Supreme Court · Case No. 142/2024", x: 20, y: 26, z: 70, rotate: -4 },
  { id: "petition", kind: "judgment", title: "PETITION", meta: "High Court Registry", x: 76, y: 20, z: -50, rotate: 5 },
  { id: "section", kind: "chip", title: "SECTION 420", x: 14, y: 64, z: 30, rotate: 3 },
  { id: "article", kind: "chip", title: "ARTICLE 21", x: 82, y: 60, z: -30, rotate: -3 },
  { id: "precedent", kind: "chip", title: "PRECEDENT", x: 36, y: 80, z: 90, rotate: 2 },
  { id: "citation", kind: "chip", title: "CITATION", x: 68, y: 84, z: -70, rotate: -5 },
];

// Unlabelled bulk documents — the "millions of pages" texture. Never become
// relevant, never converge; they simply fade back once the system has found
// what it needs, which is the whole point of scene 04.
const BULK_DOCS = Array.from({ length: 16 }).map((_, i) => {
  const angle = (i / 16) * 360;
  const r = 30 + (i % 4) * 16;
  return {
    id: `bulk-${i}`,
    x: 50 + Math.cos((angle * Math.PI) / 180) * r * 0.9,
    y: 50 + Math.sin((angle * Math.PI) / 180) * r * 0.55,
    z: -160 + (i % 5) * 70,
    rotate: ((i * 37) % 12) - 6,
    scale: 0.5 + (i % 3) * 0.12,
    appearAt: 0.14 + (i / 16) * 0.24,
  };
});

const SCENES = [
  { code: "01", tag: "LAW", heading: "The law is vast.", body: "A single archive holds centuries of judgments, statutes and reasoning." },
  { code: "02", tag: "INFORMATION", heading: "Millions of pages. Countless precedents.", body: "Judgments, petitions, sections, articles and citations — waiting to be understood." },
  { code: "03", tag: "AI", heading: "AI finds what matters.", body: "Every document is scanned; only the relevant ones are flagged, one by one." },
  { code: "04", tag: "CONNECT", heading: "Connect the law.", body: "The relevant judgment, section, article, precedent and citation thread together." },
  { code: "05", tag: "UNDERSTAND", heading: "Legal intelligence, when you need it.", body: "One clear, cited, confident answer — ready in seconds." },
];

const SCENE_BOUNDARIES = [0, 0.12, 0.38, 0.58, 0.8, 1.001];

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function DocCard({ meta }: { meta?: string; title: string }) {
  return (
    <>
      <div className="text-[7px] sm:text-[8px] tracking-[0.18em] text-[var(--lp-gold-light)] font-semibold mb-2">
        SUPREME COURT OF INDIA
      </div>
      <div className="space-y-1.5">
        <div className="h-1 w-3/4 rounded-full bg-white/15" />
        <div className="h-1 w-full rounded-full bg-white/10" />
        <div className="h-1 w-5/6 rounded-full bg-white/10" />
        <div className="h-1 w-2/3 rounded-full bg-white/10" />
      </div>
      {meta && <div className="mt-3 text-[7px] text-[var(--lp-ink-faint)]">{meta}</div>}
    </>
  );
}

export function Legal3DStory() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const bulkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const namedRefs = useRef<(HTMLDivElement | null)[]>([]);
  const namedGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const linesGroupRef = useRef<SVGGElement | null>(null);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const insightRef = useRef<HTMLDivElement | null>(null);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let raf = 0;
    let lastScene = -1;

    const render = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(scrollable, 1));

      let idx = 0;
      for (let i = 0; i < SCENE_BOUNDARIES.length - 1; i++) {
        if (progress >= SCENE_BOUNDARIES[i]) idx = i;
      }
      if (idx !== lastScene) {
        lastScene = idx;
        setSceneIndex(idx);
      }

      // Camera dolly — forward motion only, no rotation carousel. A hint of
      // tilt keeps it from feeling like a static slideshow.
      if (worldRef.current) {
        gsap.set(worldRef.current, {
          z: -60 + progress * 200,
          rotateX: -2 + progress * 2.5,
          rotateY: -1.5 + progress * 3,
        });
      }

      const connectFactor = smooth(clamp((progress - 0.58) / 0.32));
      const dissolveFactor = clamp((progress - 0.9) / 0.08);

      // Bulk "unread" documents — fade in as INFORMATION unfolds, fade back
      // (not out to zero — literally "faded back") once AI has found signal.
      BULK_DOCS.forEach((doc, i) => {
        const el = bulkRefs.current[i];
        if (!el) return;
        const fadeIn = smooth(clamp((progress - doc.appearAt) / 0.08));
        const fadeBack = smooth(clamp((progress - 0.58) / 0.26));
        const opacity = clamp(fadeIn - fadeBack * 0.82, 0.04, 1) * (1 - dissolveFactor);
        gsap.set(el, {
          opacity,
          scale: doc.scale,
          filter: `blur(${1.5 + (1 - fadeIn) * 2}px)`,
        });
      });

      // Named documents — the ones that turn out to matter.
      NAMED_DOCS.forEach((doc, i) => {
        const el = namedRefs.current[i];
        const glow = namedGlowRefs.current[i];
        if (!el) return;
        const fadeIn = smooth(clamp((progress - 0.16) / 0.16));
        const highlightThreshold = 0.4 + i * 0.028;
        const highlighted = progress > highlightThreshold;

        const x = lerp(doc.x, 50, connectFactor);
        const y = lerp(doc.y, 50, connectFactor);
        const z = lerp(doc.z, 20, connectFactor);
        const scale = (0.85 - connectFactor * 0.32) * (1 - dissolveFactor * 0.4);
        const opacity = fadeIn * (1 - dissolveFactor);

        gsap.set(el, {
          left: `${x}%`,
          top: `${y}%`,
          z,
          rotateZ: doc.rotate * (1 - connectFactor * 0.6),
          scale,
          opacity,
        });
        if (glow) {
          gsap.set(glow, { opacity: highlighted ? 0.9 : 0 });
        }

        const line = lineRefs.current[i];
        if (line) {
          const centerPx = 300; // half of the 600px world box below
          const px = (x / 100) * 600;
          const py = (y / 100) * 600;
          line.setAttribute("x1", String(px));
          line.setAttribute("y1", String(py));
          line.setAttribute("x2", String(centerPx));
          line.setAttribute("y2", String(centerPx));
        }
      });

      const linesOpacity = smooth(clamp((progress - 0.56) / 0.18)) * (1 - dissolveFactor);
      if (linesGroupRef.current) gsap.set(linesGroupRef.current, { opacity: linesOpacity * 0.5 });

      if (wordmarkRef.current) {
        const wOpacity = clamp((progress - 0.84) / 0.1);
        gsap.set(wordmarkRef.current, { opacity: wOpacity, scale: 0.9 + wOpacity * 0.1 });
      }
      if (insightRef.current) {
        const iOpacity = clamp((progress - 0.91) / 0.09);
        gsap.set(insightRef.current, {
          opacity: iOpacity,
          scale: 0.94 + iOpacity * 0.06,
          pointerEvents: iOpacity > 0.6 ? "auto" : "none",
        });
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const activeScene = SCENES[sceneIndex];
  const bulkDocs = useMemo(() => BULK_DOCS, []);

  if (reducedMotion) {
    return (
      <section id="story" className="landing-root relative py-24 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-16">
          {SCENES.map((scene) => (
            <motion.div
              key={scene.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <span className="lp-eyebrow">Scene {scene.code} — {scene.tag}</span>
              <h3 className="text-2xl sm:text-3xl font-semibold lp-font-display text-[var(--lp-ink)]">
                {scene.heading}
              </h3>
              <p className="text-sm text-[var(--lp-ink-dim)] max-w-lg">{scene.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="story" ref={wrapperRef} className="landing-root relative" style={{ height: "260vh" }}>
      {/* Soft entry vignette — the transition from the hero into the archive */}
      <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b from-[var(--lp-bg)] to-transparent z-[1] pointer-events-none" />

      <div className="sticky top-0 h-screen w-full overflow-hidden lp-stage flex flex-col lg:flex-row lg:items-center">
        <StarField density={80} goldRatio={0.13} className="opacity-70" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 68% 46%, var(--lp-gold-glow), transparent 50%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.025), transparent 40%)",
          }}
        />

        {/* ============ Text column — fixed, readable widths ============ */}
        <div className="relative z-10 w-full lg:w-[42%] px-6 sm:px-10 lg:pl-12 lg:pr-4 pt-8 lg:pt-0 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.code}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-[560px]"
            >
              <span className="lp-eyebrow">Scene {activeScene.code} — {activeScene.tag}</span>
              <h3
                className="mt-4 font-semibold lp-font-display text-[var(--lp-ink)] leading-[1.08] max-w-[620px]"
                style={{ fontSize: "clamp(2.5rem, 4.6vw, 4.4rem)" }}
              >
                {activeScene.heading}
              </h3>
              <p className="mt-4 text-sm sm:text-base text-[var(--lp-ink-dim)] leading-relaxed max-w-[500px]">
                {activeScene.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 mt-10">
            {SCENES.map((s, i) => (
              <div
                key={s.code}
                className="h-[3px] rounded-full transition-all duration-500"
                style={{ width: i === sceneIndex ? 22 : 10, background: i === sceneIndex ? "var(--lp-gold)" : "var(--lp-border)" }}
              />
            ))}
          </div>
        </div>

        {/* ============ Visual column — the archive ============ */}
        <div className="relative z-10 flex-1 min-h-0 h-[52vh] lg:h-full lp-stage">
          <div
            ref={worldRef}
            className="lp-stage-3d absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px]"
          >
            {/* Bulk unread documents — depth texture */}
            {bulkDocs.map((doc, i) => (
              <div
                key={doc.id}
                ref={(el) => {
                  bulkRefs.current[i] = el;
                }}
                className="absolute w-14 h-20 sm:w-20 sm:h-28 rounded-md border border-white/10 bg-white/[0.03]"
                style={{
                  left: `${doc.x}%`,
                  top: `${doc.y}%`,
                  transform: `translate(-50%,-50%) rotate(${doc.rotate}deg)`,
                  opacity: 0,
                }}
              />
            ))}

            {/* Connective lines to the archive's center */}
            <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
              <g ref={linesGroupRef} opacity={0}>
                {NAMED_DOCS.map((d, i) => (
                  <line
                    key={d.id}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    stroke="var(--lp-gold)"
                    strokeWidth="1"
                  />
                ))}
              </g>
            </svg>

            {/* Named, relevant documents */}
            {NAMED_DOCS.map((doc, i) => (
              <div
                key={doc.id}
                ref={(el) => {
                  namedRefs.current[i] = el;
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ opacity: 0 }}
              >
                <div
                  ref={(el) => {
                    namedGlowRefs.current[i] = el;
                  }}
                  className="absolute -inset-2 rounded-xl blur-lg"
                  style={{ background: "var(--lp-gold-glow)", opacity: 0 }}
                />
                {doc.kind === "judgment" ? (
                  <div className="relative w-24 h-32 sm:w-32 sm:h-44 rounded-lg lp-card border-[var(--lp-border-strong)] p-2.5 sm:p-3">
                    <DocCard title={doc.title} meta={doc.meta} />
                  </div>
                ) : (
                  <div className="relative lp-card border-[var(--lp-border-strong)] rounded-full px-3 py-1.5 text-[9px] sm:text-[10px] font-semibold tracking-wide text-[var(--lp-gold-light)] whitespace-nowrap">
                    {doc.title}
                  </div>
                )}
              </div>
            ))}

            {/* Resolution — wordmark + insight card */}
            <div
              ref={wordmarkRef}
              className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl font-semibold tracking-[0.1em] lp-font-display lp-gold-text"
              style={{ opacity: 0 }}
            >
              LEGALAI
            </div>
            <div
              ref={insightRef}
              className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 lp-card rounded-2xl p-5 text-left"
              style={{ opacity: 0 }}
            >
              <span className="lp-eyebrow">Relevant Precedents</span>
              <p className="mt-2 text-sm text-[var(--lp-ink)] font-medium leading-snug">
                3 highly relevant judgments found
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-[var(--lp-ink-faint)] uppercase tracking-widest">Confidence</span>
                <span className="text-xl font-semibold lp-gold-text lp-font-display">94%</span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-[var(--lp-border)] overflow-hidden">
                <div className="h-full w-[94%] bg-[var(--lp-gold)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
