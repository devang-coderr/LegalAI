"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const COLUMN_COUNT = 9;
const COLUMN_CENTER = 4;

function ColumnStrip({
  index,
  columnSpread,
}: {
  index: number;
  columnSpread: ReturnType<typeof useTransform<number, number>>;
}) {
  const distance = Math.abs(index - COLUMN_CENTER);
  const x = useTransform(columnSpread, (v) => (index - COLUMN_CENTER) * distance * 6 * v);
  const opacity = useTransform(columnSpread, [0, 1], [0, 0.14 - distance * 0.012]);

  return (
    <motion.div
      style={{ height: "68%", x, opacity }}
      className="w-[4%] bg-gradient-to-t from-[var(--ink)] to-transparent"
    />
  );
}

export function ArchitectureReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lightOpacity = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);
  const columnSpread = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.6], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative flex h-[140vh] items-center justify-center overflow-hidden bg-[var(--void)]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center">
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-3 px-6 sm:gap-6">
          {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
            <ColumnStrip key={i} index={i} columnSpread={columnSpread} />
          ))}
        </div>

        <motion.div
          style={{ opacity: lightOpacity }}
          className="signature-beam pointer-events-none absolute left-1/2 top-0 h-full w-[420px] -translate-x-1/2 blur-3xl"
        />

        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="font-[family-name:var(--font-display)] text-2xl italic leading-relaxed text-[var(--ink)] sm:text-3xl">
            &ldquo;The law is reason, free from passion.&rdquo;
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            Built on that principle
          </p>
        </motion.div>
      </div>
    </section>
  );
}
