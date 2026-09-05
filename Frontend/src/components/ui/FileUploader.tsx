"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  acceptedFormats?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUploader({
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  acceptedFormats = ".pdf,.doc,.docx,.png,.jpg",
  maxSizeMB = 15,
  className,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center",
          dragOver
            ? "border-[var(--accent-gold)] bg-[var(--accent-gold-light)]"
            : "border-[var(--border-color)] bg-[var(--bg-card)]/40 hover:border-[var(--accent-gold)] hover:bg-[var(--bg-secondary)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        />

        {!selectedFile ? (
          <>
            <div className="p-3.5 rounded-2xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)] mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Drop legal document here, or <span className="text-[var(--accent-gold)] underline">browse</span>
            </h4>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Supports PDF, DOCX, PNG, JPG (Max {maxSizeMB}MB)
            </p>
          </>
        ) : (
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-[var(--accent-gold-light)] text-[var(--accent-gold)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left truncate">
                <h5 className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {selectedFile.name}
                </h5>
                <p className="text-xs text-[var(--text-secondary)]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing... {uploadProgress}%</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 px-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
