"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FileUploader } from "@/components/ui/FileUploader";

export default function DocumentOCRPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);

  const handleFileSelect = () => {
    setIsProcessing(true);
    setOcrComplete(false);

    setTimeout(() => {
      setIsProcessing(false);
      setOcrComplete(true);
    }, 1200);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="gold">OCR & Contract Intelligence</Badge>
        <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
          Document Intelligence & Risk Checker
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Upload rental agreements, legal notices, or court summons. Our OCR backend extracts dates, key clauses, and flags potential legal risks.
        </p>
      </div>

      {/* Uploader Box */}
      <Card variant="glass" className="p-6">
        <FileUploader onFileSelect={handleFileSelect} isUploading={isProcessing} uploadProgress={75} />
      </Card>

      {/* OCR Processing State */}
      {isProcessing && (
        <Card variant="glass" className="p-8 text-center space-y-4 border-amber-500/30">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
            Processing Document with OCR Engine...
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Extracting text chunks, detecting clauses, and scanning for onerous risks...
          </p>
        </Card>
      )}

      {/* OCR & Risk Analysis Output */}
      {ocrComplete && (
        <div className="space-y-6">
          {/* Risk Warning Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-200">2 Potential Risk Clauses Detected</h4>
              <p className="mt-0.5 text-amber-300/80">
                The uploaded agreement contains an unilateral lock-in penalty and automatic 15% rent escalation clause.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clause Risks Detected */}
            <Card variant="glass" className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-serif">
                <ShieldAlert className="w-4 h-4" />
                <span>Detected Clause Risks</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">Unilateral Lock-In Penalty</span>
                    <Badge variant="danger" size="sm">HIGH RISK</Badge>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Clause 14 requires tenant to pay remaining 11 months rent if vacating prior to lock-in, with no reciprocal obligation on landlord.
                  </p>
                </div>
              </div>
            </Card>

            {/* Extracted Key Dates */}
            <Card variant="glass" className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm font-serif">
                <Calendar className="w-4 h-4" />
                <span>Important Extracted Dates</span>
              </div>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                  <span>Agreement Execution Date</span>
                  <span className="font-bold text-[var(--text-primary)]">01 April 2026</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                  <span>Lease Expiry Date</span>
                  <span className="font-bold text-[var(--text-primary)]">01 March 2027</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]">
                  <span>Notice Period Cut-off</span>
                  <span className="font-bold text-amber-400">30 January 2027</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Required Documents Checklist */}
          <Card variant="glass" className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-serif">
              <CheckSquare className="w-4 h-4" />
              <span>Document Verification Checklist</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: "Government Identity Proof (Aadhaar / PAN)", status: "VERIFIED" },
                { name: "Rental Agreement Copy", status: "VERIFIED" },
                { name: "Security Deposit Bank Transfer Receipt", status: "MISSING" },
                { name: "Property Possession Handover Letter", status: "OPTIONAL" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-primary)] font-medium">{item.name}</span>
                  <Badge variant={item.status === "VERIFIED" ? "success" : item.status === "MISSING" ? "danger" : "neutral"} size="sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
