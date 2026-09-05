"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  MessageSquareText,
  Send,
  Upload,
  X,
  Save,
  CheckCircle2,
  FolderOpen,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { FileUploader } from "@/components/ui/FileUploader";
import { useNotification } from "@/components/ui/ToastProvider";
import { useDocuments, validateDocumentFile } from "@/hooks/useDocuments";
import { useMyCases } from "@/hooks/useMyCases";
import { DOCUMENT_CATEGORIES, type ManagedDocument } from "@/types/document";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status: ManagedDocument["status"]) {
  switch (status) {
    case "uploading": return "Uploading document…";
    case "processing": return "Processing OCR & AI…";
    case "ready": return "Ready";
    case "failed": return "Processing failed";
  }
}

export default function CitizenDocumentsPage() {
  const {
    documents, selectedDocument, selectDocument, uploadDocument,
    retryProcessing, saveDocument, attachToCase, deleteDocument, setCategory, askQuestion,
    qaHistory, qaLoading, qaError, savingId, pendingFiles,
  } = useDocuments();
  const { cases } = useMyCases();
  const { showToast } = useNotification();

  const [uploaderKey, setUploaderKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedDocument | null>(null);
  const [attachModalDoc, setAttachModalDoc] = useState<ManagedDocument | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [question, setQuestion] = useState("");

  const handleFileSelect = async (file: File) => {
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setUploadError(validationError);
      setUploaderKey((k) => k + 1);
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    await uploadDocument(file);
    setIsUploading(false);
    setUploaderKey((k) => k + 1);
    showToast("info", "Document extracted", "Temporary preview ready. Click 'Save Document' to keep it in My Documents.");
  };

  const handleSave = async (doc: ManagedDocument) => {
    const res = await saveDocument(doc.id);
    if (res.success) {
      showToast("success", "Document saved", `${doc.fileName} saved to My Documents.`);
    } else {
      showToast("error", "Save failed", res.error || "Could not save document.");
    }
  };

  const handleAttachCase = async () => {
    if (!attachModalDoc) return;
    const caseIdToSet = selectedCaseId ? selectedCaseId : null;
    const res = await attachToCase(attachModalDoc.id, caseIdToSet);
    if (res.success) {
      const caseName = cases.find((c) => c.id === selectedCaseId)?.title;
      showToast(
        "success",
        caseIdToSet ? "Document Attached" : "Document Detached",
        caseIdToSet ? `Attached to ${caseName || "Case"}` : "Document is now standalone in My Documents."
      );
      setAttachModalDoc(null);
    } else {
      showToast("error", "Failed", res.error || "Could not update case attachment.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDocument(deleteTarget.id);
    showToast("success", "Document deleted", deleteTarget.fileName);
    setDeleteTarget(null);
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !question.trim()) return;
    askQuestion(selectedDocument.id, question);
    setQuestion("");
  };

  const getCaseTitle = (caseId?: string | null) => {
    if (!caseId) return null;
    const found = cases.find((c) => c.id === caseId);
    return found ? found.title : `Case #${caseId.slice(0, 8)}`;
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">My Documents</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload, inspect, save and attach your legal documents to cases.
          </p>
        </div>
      </div>

      {/* Upload */}
      <Card variant="glass" className="p-6 space-y-3">
        <FileUploader
          key={uploaderKey}
          onFileSelect={handleFileSelect}
          isUploading={isUploading}
          acceptedFormats=".pdf,.jpg,.jpeg,.png"
          maxSizeMB={15}
        />
        {uploadError && (
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <span>Supported formats: PDF, JPG, PNG (Max 15MB)</span>
          <span>OCR and AI Risk Analysis run automatically</span>
        </div>
      </Card>

      {documents.length === 0 ? (
        <EmptyState
          icon={<Upload className="w-8 h-8" />}
          title="No documents uploaded yet"
          description="Upload a document above to get started — legal notices, agreements, court orders, and evidence."
          className="p-16"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6 items-start">
          {/* Document list */}
          <div className="space-y-3">
            {documents.map((doc) => {
              const caseTitle = getCaseTitle(doc.caseId);
              return (
                <Card
                  key={doc.id}
                  variant="glass"
                  onClick={() => selectDocument(doc.id)}
                  className={`p-4 cursor-pointer transition-colors ${selectedDocument?.id === doc.id ? "border-[var(--accent-gold)]/60 bg-[var(--accent-gold-light)]/10" : "hover:border-[var(--border-hover)]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)] shrink-0">
                      {doc.fileType.startsWith("image/") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="neutral" size="sm">{doc.category}</Badge>
                        {doc.isSaved ? (
                          <Badge variant="success" size="sm">Saved</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Temporary Preview</Badge>
                        )}
                        {caseTitle && (
                          <Badge variant="gold" size="sm" className="truncate max-w-[140px]">
                            {caseTitle}
                          </Badge>
                        )}
                        <span className="text-[10px] text-[var(--text-muted)]">{formatSize(doc.sizeBytes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {doc.status === "processing" || doc.status === "uploading" ? (
                          <span className="flex items-center gap-1.5 text-[var(--accent-gold)]"><Loader2 className="w-3 h-3 animate-spin" />{statusLabel(doc.status)}</span>
                        ) : doc.status === "failed" ? (
                          <span className="flex items-center gap-1.5 text-rose-400"><AlertCircle className="w-3 h-3" />{statusLabel(doc.status)}</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {statusLabel(doc.status)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
                    {!doc.isSaved && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={savingId === doc.id}
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                        onClick={(e) => { e.stopPropagation(); handleSave(doc); }}
                        className="text-xs py-1 px-2.5 h-7"
                      >
                        Save
                      </Button>
                    )}
                    <a
                      href={doc.objectUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="View document"
                      aria-label={`View ${doc.fileName}`}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`${doc.objectUrl}?download=true`}
                      download={doc.fileName}
                      onClick={(e) => e.stopPropagation()}
                      title="Download document"
                      aria-label={`Download ${doc.fileName}`}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                      title="Delete document"
                      aria-label={`Delete ${doc.fileName}`}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Document workspace */}
          <div>
            {!selectedDocument ? (
              <EmptyState title="Select a document" description="Choose a document from the list to view its details." className="p-16" />
            ) : (
              <motion.div key={selectedDocument.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Save Prompt Banner if Unsaved */}
                {!selectedDocument.isSaved && (
                  <Card variant="glass" className="p-4 border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>This document is a <strong>temporary preview</strong>. Save it to keep it permanently in My Documents.</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={savingId === selectedDocument.id}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                      onClick={() => handleSave(selectedDocument)}
                    >
                      Save Document
                    </Button>
                  </Card>
                )}

                <Card variant="glass" className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">{selectedDocument.fileName}</h3>
                        {selectedDocument.isSaved ? (
                          <Badge variant="success" size="sm">Saved in Vault</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Temporary</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {formatSize(selectedDocument.sizeBytes)} • Uploaded {new Date(selectedDocument.uploadedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                        Category
                        <select
                          value={selectedDocument.category}
                          onChange={(e) => setCategory(selectedDocument.id, e.target.value as ManagedDocument["category"])}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)]"
                        >
                          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </label>

                      {selectedDocument.isSaved && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setAttachModalDoc(selectedDocument);
                            setSelectedCaseId(selectedDocument.caseId || "");
                          }}
                        >
                          {selectedDocument.caseId ? "Linked to Case" : "Attach to Case"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedDocument.caseId && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs">
                      <FolderOpen className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                      <span className="text-[var(--text-muted)]">Attached to Case:</span>
                      <span className="font-medium text-[var(--text-primary)]">{getCaseTitle(selectedDocument.caseId)}</span>
                      <button
                        onClick={() => attachToCase(selectedDocument.id, null)}
                        title="Detach from Case"
                        className="ml-auto text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Unlink className="w-3 h-3" /> Detach
                      </button>
                    </div>
                  )}

                  {selectedDocument.fileType.startsWith("image/") ? (
                    <div className="relative w-full h-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
                      <Image src={selectedDocument.objectUrl} alt={selectedDocument.fileName} fill unoptimized className="object-contain" />
                    </div>
                  ) : (
                    <iframe src={selectedDocument.objectUrl} title={selectedDocument.fileName} className="w-full h-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]" />
                  )}
                </Card>

                {(selectedDocument.status === "uploading" || selectedDocument.status === "processing") && (
                  <Card variant="glass" className="p-6 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-gold)] mx-auto" />
                    <p className="text-xs text-[var(--text-secondary)]">{statusLabel(selectedDocument.status)}</p>
                  </Card>
                )}

                {selectedDocument.status === "failed" && (
                  <Card variant="glass" className="p-5 border-rose-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-rose-300">Text extraction failed</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{selectedDocument.errorMessage || "Please try again."}</p>
                      <Button
                        variant="outline" size="sm" className="mt-3"
                        onClick={() => {
                          const file = pendingFiles[selectedDocument.id];
                          if (file) retryProcessing(selectedDocument.id, file);
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </Card>
                )}

                {selectedDocument.status === "ready" && selectedDocument.ocr && (
                  <>
                    <Card variant="glass" className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-sm font-serif">
                        <Sparkles className="w-4 h-4" /> Document Summary
                      </div>
                      {selectedDocument.ocr.summary ? (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedDocument.ocr.summary}</p>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          {selectedDocument.ocr.unavailableReason || "Summary not available yet."}
                        </p>
                      )}
                    </Card>

                    <Card variant="glass" className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif">
                        <Info className="w-4 h-4 text-amber-400" /> Important Information
                      </div>
                      {selectedDocument.ocr.detectedDates.length === 0 && selectedDocument.ocr.missingChecklist.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic">Not available yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {selectedDocument.ocr.detectedDates.map((d, i) => (
                            <div key={i}>
                              <p className="text-[var(--text-muted)]">{d.label}</p>
                              <p className="font-medium text-[var(--text-primary)]">{d.date}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* AI Risk Assessment */}
                    {selectedDocument.ocr.risks && selectedDocument.ocr.risks.length > 0 && (
                      <Card variant="glass" className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif">
                          <AlertCircle className="w-4 h-4 text-rose-400" /> Risk Assessment
                        </div>
                        <div className="space-y-2">
                          {selectedDocument.ocr.risks.map((r, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[var(--text-primary)]">{r.clause}</span>
                                <Badge variant={r.riskLevel === "HIGH" ? "danger" : r.riskLevel === "MEDIUM" ? "warning" : "neutral"} size="sm">
                                  {r.riskLevel} Risk
                                </Badge>
                              </div>
                              <p className="text-[var(--text-secondary)]">{r.explanation}</p>
                              {r.recommendation && (
                                <p className="text-[var(--accent-gold)] text-[11px] mt-1">Recommendation: {r.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    <Card variant="glass" className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif">
                        <FileText className="w-4 h-4 text-[var(--text-muted)]" /> Extracted Text
                      </div>
                      {selectedDocument.ocr.extractedText ? (
                        <div className="max-h-56 overflow-y-auto text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                          {selectedDocument.ocr.extractedText}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          {selectedDocument.ocr.unavailableReason || "Text extraction not available yet."}
                        </p>
                      )}
                    </Card>

                    {/* Ask About This Document */}
                    <Card variant="glass" className="p-5 space-y-4">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm font-serif">
                        <MessageSquareText className="w-4 h-4 text-[var(--accent-gold)]" /> Ask About This Document
                      </div>

                      {qaHistory.length > 0 && (
                        <div className="space-y-3">
                          {qaHistory.map((qa, i) => (
                            <div key={i} className="space-y-1.5">
                              <p className="text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-lg px-3 py-2 w-fit ml-auto">{qa.question}</p>
                              <p className="text-xs text-[var(--text-secondary)] bg-[var(--accent-gold-light)] rounded-lg px-3 py-2">{qa.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {qaLoading && (
                        <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                        </div>
                      )}
                      {qaError && !qaLoading && (
                        <p className="text-xs text-rose-400">{qaError}</p>
                      )}

                      <form onSubmit={handleAsk} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Ask a question about this document…"
                          className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                        />
                        <Button type="submit" variant="primary" size="sm" isLoading={qaLoading} rightIcon={<Send className="w-3.5 h-3.5" />}>
                          Ask
                        </Button>
                      </form>
                    </Card>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Attach to Case Modal */}
      <Modal isOpen={!!attachModalDoc} onClose={() => setAttachModalDoc(null)} title="Attach Document to Case">
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Select an active case to attach <strong className="text-[var(--text-primary)]">{attachModalDoc?.fileName}</strong> to. Attached documents will be visible in the case documents tab.
          </p>
          {cases.length === 0 ? (
            <div className="p-4 rounded-lg bg-[var(--bg-secondary)] text-center text-xs text-[var(--text-muted)]">
              No active cases found. Create a case or connect with a lawyer first.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Select Case</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
              >
                <option value="">None (Standalone Document)</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Case #{c.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAttachModalDoc(null)} leftIcon={<X className="w-3.5 h-3.5" />}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAttachCase} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Save Attachment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete document?">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone. <span className="text-[var(--text-primary)] font-medium">{deleteTarget?.fileName}</span> will be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} leftIcon={<X className="w-3.5 h-3.5" />}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
