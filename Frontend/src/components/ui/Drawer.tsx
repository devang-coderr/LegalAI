"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-screen max-w-xl bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl flex flex-col justify-between p-6 overflow-y-auto z-10",
                className
              )}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                  {title && (
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-serif">
                      {title}
                    </h3>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors ml-auto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-6">{children}</div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
