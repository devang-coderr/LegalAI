"use client";

import { motion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Columns } from "./Columns";
import { LightBeam } from "./LightBeam";
import { Particles } from "./Particles";
import { LadyJustice } from "./LadyJustice";

const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.15 * i, ease: SIGNATURE_EASE },
  }),
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[var(--void)] px-6"
    >
      <Columns />
      <LightBeam />
      <Particles />

      {/* radial vignette to keep focus centered */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 0%, transparent 35%, var(--void) 85%)",
        }}
      />

      <div className="relative z-10 -mb-16 mt-24 w-full max-w-lg opacity-90 sm:mt-16">
        <LadyJustice />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)]/60 px-4 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)] backdrop-blur-sm"
        >
          Legal intelligence, reasoned
        </motion.p>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-balance font-[family-name:var(--font-display)] text-5xl font-medium leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl"
        >
          Where every case
          <br />
          <span className="italic text-[var(--azure)]">meets its precedent.</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg"
        >
          LegalAI reads your case the way a researcher would — surfacing the facts,
          the governing law, and the judgments that came before it. Built for
          citizens seeking clarity and lawyers who need speed.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button href="/login?role=citizen" showArrow>Continue as Citizen</Button>
          <Button href="/login?role=lawyer" variant="ghost">Continue as Lawyer</Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[var(--ink-faint)]"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
