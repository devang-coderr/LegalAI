"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileUploader } from "@/components/ui/FileUploader";

export default function BriefAnalyzerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileSelect = () => {
    setIsProcessing(true);
    setAnalyzed(false);

    setTimeout(() => {
      setIsProcessing(false);
      setAnalyzed(true);
    }, 1000);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="space-y-2">
        <Badge variant="violet">Professional Brief Intelligence</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Contract & Legal Brief Analyzer
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Automated extraction of clause risks, contradictory statements, and statutory non-compliance.
        </p>
      </div>

      <Card variant="glass" className="p-6">
        <FileUploader onFileSelect={handleFileSelect} isUploading={isProcessing} uploadProgress={85} />
      </Card>

      {analyzed && (
        <div className="space-y-6">
          <Card variant="glass" className="p-6 space-y-4 border-purple-500/30">
            <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
              Brief Analysis Output
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Extracted 12 statutory clauses, identified 1 non-compete risk under Section 27 Indian Contract Act.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
