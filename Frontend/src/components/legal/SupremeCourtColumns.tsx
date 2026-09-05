"use client";

import React from "react";
import { motion } from "framer-motion";

export function SupremeCourtColumns() {
  return (
    <div className="relative w-full py-16 overflow-hidden flex items-center justify-center pointer-events-none">
      {/* Background Architectural Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/10 to-amber-500/5 blur-3xl" />

      <div className="max-w-6xl w-full px-4 flex items-end justify-around gap-2 sm:gap-6 opacity-30 dark:opacity-20">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((colIndex) => (
          <motion.div
            key={colIndex}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: colIndex * 0.08 }}
            className="flex flex-col items-center w-full max-w-[80px]"
          >
            {/* Column Capital */}
            <div className="w-full h-4 sm:h-6 rounded-t-lg bg-gradient-to-r from-amber-500/40 via-blue-500/40 to-amber-500/40 border-b border-amber-400/50" />
            <div className="w-[85%] h-2 bg-slate-300 dark:bg-slate-700" />
            {/* Column Shaft with Vertical Fluting */}
            <div className="w-[70%] h-48 sm:h-64 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-x border-slate-400/20 flex justify-around px-1">
              <div className="w-[2px] h-full bg-black/10 dark:bg-white/5" />
              <div className="w-[2px] h-full bg-black/10 dark:bg-white/5" />
              <div className="w-[2px] h-full bg-black/10 dark:bg-white/5" />
            </div>
            {/* Column Base */}
            <div className="w-[90%] h-3 bg-slate-400 dark:bg-slate-700" />
            <div className="w-full h-4 sm:h-6 rounded-b-md bg-slate-500 dark:bg-slate-800" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
