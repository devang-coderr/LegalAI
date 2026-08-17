"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type LocalFile = {
  id: string;
  name: string;
  sizeLabel: string;
  status: "uploading" | "processing" | "analyzed";
};

const PROCESSING_STAGES = ["Uploading", "OCR processing", "Extracting text", "AI analysis"];

export function FileUploader() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const next: LocalFile[] = Array.from(list).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      sizeLabel: `${(f.size / 1024).toFixed(0)} KB`,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...next]);

    next.forEach((file) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );
      }, 700);
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "analyzed" } : f))
        );
      }, 700 + PROCESSING_STAGES.length * 550);
    });
  }, []);

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-300",
          dragging
            ? "border-[var(--azure)] bg-[var(--azure-soft)]"
            : "border-[var(--surface-border)] hover:border-[var(--azure)]/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
          accept=".pdf,.png,.jpg,.jpeg"
        />
        <UploadCloud className="h-8 w-8 text-[var(--azure)]" />
        <p className="mt-3 text-sm font-medium text-[var(--ink)]">
          Drag & drop a PDF or image, or click to browse
        </p>
        <p className="mt-1 text-xs text-[var(--ink-faint)]">
          Notices, agreements, judgments — PDF, JPG, PNG up to 10MB
        </p>
      </div>

      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card glow={false} className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--azure-soft)] text-[var(--azure)]">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-[var(--ink)]">{file.name}</p>
                  <p className="text-xs text-[var(--ink-faint)]">{file.sizeLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {file.status !== "analyzed" ? (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {file.status === "uploading" ? "Uploading" : "OCR & analysis"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Analyzed
                  </span>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-[var(--ink-faint)] hover:text-[var(--ink)]"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>

            {file.status === "analyzed" && <DemoAnalysisResult />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DemoAnalysisResult() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)]/50 p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--azure)]">
          Document Summary
        </p>
        <span className="rounded-full bg-[var(--gold-soft)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--gold)]">
          Demo Data
        </span>
      </div>
      <p className="text-sm text-[var(--ink-muted)]">
        A tenancy notice referencing non-payment of rent for two consecutive months, with a
        14-day cure period before further action.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-[var(--ink)]">Important Dates</p>
          <p className="text-xs text-[var(--ink-faint)]">Notice date: 2026-07-15 · Cure period ends: 2026-07-29</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--ink)]">Detected Legal Terms</p>
          <p className="text-xs text-[var(--ink-faint)]">&ldquo;cure period&rdquo;, &ldquo;quit notice&rdquo;, &ldquo;arrears&rdquo;</p>
        </div>
      </div>
    </motion.div>
  );
}
