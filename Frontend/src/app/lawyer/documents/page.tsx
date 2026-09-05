"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileUploader } from "@/components/ui/FileUploader";
import { useLawyerDocuments } from "@/hooks/useLawyerDocuments";
import { useLawyerClients } from "@/hooks/useLawyerClients";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { LAWYER_DOCUMENT_TYPES, type LawyerDocument, type LawyerDocumentType } from "@/types/lawyer";
import type { DocumentAnalysisResult, DocumentQAAnswer } from "@/types/document";
import { analyzeDocument, askDocumentQuestion } from "@/services/document.api";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LawyerDocumentsPage() {
  const { documents, uploadDocument, deleteDocument, updateDocumentAnalysis } = useLawyerDocuments();
  const { clients } = useLawyerClients();
  const { cases } = useLawyerCases();

  const [modalOpen, setModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [docType, setDocType] = useState<LawyerDocumentType>("Pleading");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // AI Intelligence Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LawyerDocument | null>(null);
  const [aiTab, setAiTab] = useState<"summary" | "keyInfo" | "qa">("summary");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Document Q&A State
  const [qaMap, setQaMap] = useState<Record<string, DocumentQAAnswer[]>>({});
  const [qaInput, setQaInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const casesForSelectedClient = cases.filter((c) => c.clientId === clientId);
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "Unknown client";
  const caseTitle = (id?: string) => (id ? cases.find((c) => c.id === id)?.title : undefined);

  const handleFile = (file: File) => {
    if (!clientId) return;
    uploadDocument(file, { clientId, caseId: caseId || undefined, documentType: docType });
    setModalOpen(false);
    setCaseId("");
  };

  const handleOpenAiAnalysis = async (doc: LawyerDocument) => {
    setSelectedDoc(doc);
    setAiModalOpen(true);
    setAiTab("summary");
    setAnalysisError(null);
    setQaError(null);

    // If document does not yet have deep analysis, run on-demand analysis
    if (!doc.analysis) {
      setIsAnalyzing(true);
      try {
        const res = await analyzeDocument(doc.id);
        if (res.success && res.data) {
          updateDocumentAnalysis(doc.id, res.data);
          setSelectedDoc({ ...doc, analysis: res.data });
        } else {
          setAnalysisError(res.error?.message || "Could not generate AI analysis for this document.");
        }
      } catch {
        setAnalysisError("An error occurred while analyzing the document.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !qaInput.trim() || isAsking) return;

    const q = qaInput.trim();
    setQaInput("");
    setIsAsking(true);
    setQaError(null);

    try {
      const res = await askDocumentQuestion(selectedDoc.id, q);
      if (res.success && res.data) {
        setQaMap((prev) => ({
          ...prev,
          [selectedDoc.id]: [...(prev[selectedDoc.id] || []), res.data],
        }));
      } else {
        setQaError(res.error?.message || "Unable to retrieve answer. Please try again.");
      }
    } catch {
      setQaError("Network error occurred while asking question.");
    } finally {
      setIsAsking(false);
    }
  };

  const currentAnalysis = selectedDoc?.analysis;
  const currentQaList = selectedDoc ? qaMap[selectedDoc.id] || [] : [];

  return (
    <div className="text-[var(--text-primary)] space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif">Documents</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Case and client documents, organized with AI Document Intelligence.</p>
        </div>
        <Button
          variant="gold"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
          disabled={clients.length === 0}
        >
          Upload Document
        </Button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents yet"
          description="Add a client first — every document is associated with a client and, optionally, a case."
          className="p-16"
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents yet"
          description="Upload a document and associate it with a client and case."
          actionLabel="Upload Document"
          onAction={() => setModalOpen(true)}
          className="p-16"
        />
      ) : (
        <div className="space-y-3">
          {documents.map((d) => (
            <Card key={d.id} variant="glass" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{d.fileName}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-[var(--text-secondary)]">
                    <Badge size="sm" variant="neutral">{d.documentType}</Badge>
                    <span>{clientName(d.clientId)}</span>
                    {caseTitle(d.caseId) && <span>· {caseTitle(d.caseId)}</span>}
                    <span className="text-[var(--text-muted)]">{formatSize(d.sizeBytes)}</span>
                    <span className="text-[var(--text-muted)]">{new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenAiAnalysis(d)}
                >
                  AI Analyze
                </Button>
                <a href={d.objectUrl} target="_blank" rel="noreferrer" title="View" aria-label={`View ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)]"><Eye className="w-3.5 h-3.5" /></a>
                <a href={`${d.objectUrl}?download=true`} download={d.fileName} title="Download" aria-label={`Download ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)]"><Download className="w-3.5 h-3.5" /></a>
                <button onClick={() => setDeleteTarget(d.id)} title="Delete" aria-label={`Delete ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Client *</span>
            <select value={clientId} onChange={(e) => { setClientId(e.target.value); setCaseId(""); }} className="lp-input">
              <option value="">Select a client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {clientId && (
            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Case</span>
              <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="lp-input">
                <option value="">Not linked to a specific case</option>
                {casesForSelectedClient.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Document Type</span>
            <select value={docType} onChange={(e) => setDocType(e.target.value as LawyerDocumentType)} className="lp-input">
              {LAWYER_DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          {clientId ? (
            <FileUploader onFileSelect={handleFile} acceptedFormats=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic">Select a client to enable upload.</p>
          )}
        </div>
      </Modal>

      {/* AI Document Intelligence Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={`AI Intelligence — ${selectedDoc?.fileName || "Document"}`}
      >
        <div className="space-y-5">
          {/* Navigation Tabs */}
          <div className="flex border-b border-[var(--border-color)] gap-4">
            <button
              onClick={() => setAiTab("summary")}
              className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                aiTab === "summary"
                  ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Summary
            </button>
            <button
              onClick={() => setAiTab("keyInfo")}
              className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                aiTab === "keyInfo"
                  ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Key Information
            </button>
            <button
              onClick={() => setAiTab("qa")}
              className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                aiTab === "qa"
                  ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask Document {currentQaList.length > 0 && `(${currentQaList.length})`}
            </button>
          </div>

          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-gold)]" />
              <p className="text-xs text-[var(--text-secondary)]">Analyzing document text with grounded AI intelligence...</p>
            </div>
          ) : analysisError ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-0.5 opacity-90">{analysisError}</p>
                {selectedDoc && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleOpenAiAnalysis(selectedDoc)}>
                    Retry Analysis
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Tab A: Summary */}
              {aiTab === "summary" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Document Type</span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                        {currentAnalysis?.documentType || selectedDoc?.documentType || "Legal Document"}
                      </p>
                    </div>
                    <Badge variant="gold">Grounded</Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Executive Summary</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-secondary)]/30 p-3.5 rounded-xl border border-[var(--border-color)]">
                      {currentAnalysis?.summary || "Document processed and stored. No summary available."}
                    </p>
                  </div>

                  {currentAnalysis?.keyFacts && currentAnalysis.keyFacts.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Key Facts</span>
                      <ul className="space-y-1.5">
                        {currentAnalysis.keyFacts.map((fact, idx) => (
                          <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--accent-gold)] shrink-0 font-bold">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab B: Key Information */}
              {aiTab === "keyInfo" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Parties */}
                  {currentAnalysis?.parties && currentAnalysis.parties.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                        <Users className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                        <span>Parties Mentioned</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentAnalysis.parties.map((p, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--text-primary)]">{p.name}</span>
                            <Badge size="sm" variant="neutral">{p.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates & Amounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentAnalysis?.dates && currentAnalysis.dates.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                          <Calendar className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                          <span>Important Dates</span>
                        </div>
                        <div className="space-y-1.5">
                          {currentAnalysis.dates.map((d, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-[var(--bg-secondary)]/40 border border-[var(--border-color)] text-xs flex justify-between">
                              <span className="text-[var(--text-muted)]">{d.label}</span>
                              <span className="font-medium text-[var(--text-primary)]">{d.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentAnalysis?.amounts && currentAnalysis.amounts.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Financial Amounts</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentAnalysis.amounts.map((amt, idx) => (
                            <Badge key={idx} variant="success" size="sm">{amt}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Important Clauses & Obligations */}
                  {currentAnalysis?.importantClauses && currentAnalysis.importantClauses.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                        <FileText className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                        <span>Important Clauses</span>
                      </div>
                      <div className="space-y-2">
                        {currentAnalysis.importantClauses.map((c, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] space-y-1">
                            <span className="text-xs font-semibold text-[var(--text-primary)]">{c.title}</span>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentAnalysis?.obligations && currentAnalysis.obligations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Obligations</span>
                      </div>
                      <div className="space-y-1.5">
                        {currentAnalysis.obligations.map((o, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] text-xs flex items-start gap-2">
                            <span className="font-semibold text-[var(--accent-gold)] shrink-0">{o.party}:</span>
                            <span className="text-[var(--text-secondary)]">{o.obligation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statutory Provisions */}
                  {currentAnalysis?.statutoryProvisions && currentAnalysis.statutoryProvisions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Statutory Provisions Explicitly Mentioned</span>
                      </div>
                      <div className="space-y-1.5">
                        {currentAnalysis.statutoryProvisions.map((sp, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] text-xs flex justify-between items-center">
                            <span className="font-medium text-[var(--text-primary)]">{sp.provision}</span>
                            {sp.notes && <span className="text-[11px] text-[var(--text-muted)] italic">{sp.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Info & Contradictions */}
                  {currentAnalysis?.missingInfo && currentAnalysis.missingInfo.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">Missing Information / Omissions</span>
                      <ul className="space-y-1">
                        {currentAnalysis.missingInfo.map((m, idx) => (
                          <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-amber-400 shrink-0">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentAnalysis?.contradictions && currentAnalysis.contradictions.length > 0 ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold">Contradictions Detected</span>
                      <ul className="space-y-1">
                        {currentAnalysis.contradictions.map((c, idx) => (
                          <li key={idx} className="text-xs text-rose-300 flex items-start gap-2">
                            <span className="text-rose-400 shrink-0">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-[var(--border-color)]/60">
                      No clear contradiction identified in the provided document.
                    </p>
                  )}
                </div>
              )}

              {/* Tab C: Ask Document */}
              {aiTab === "qa" && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                    {currentQaList.length === 0 ? (
                      <div className="text-center py-8 text-[var(--text-muted)] text-xs space-y-1">
                        <MessageSquare className="w-5 h-5 mx-auto opacity-50 mb-1" />
                        <p className="font-medium">No questions asked yet.</p>
                        <p className="text-[11px]">Ask anything grounded in this document (e.g., &quot;What is the payment deadline?&quot; or &quot;Who are the parties?&quot;).</p>
                      </div>
                    ) : (
                      currentQaList.map((qa, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[var(--accent-gold-light)] border border-[var(--accent-gold)]/20 p-2.5 text-xs text-[var(--text-primary)]">
                              <p className="font-semibold text-[11px] text-[var(--accent-gold)] mb-0.5">You asked</p>
                              {qa.question}
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="max-w-[90%] rounded-xl rounded-tl-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3 text-xs text-[var(--text-secondary)] space-y-1">
                              <p className="font-semibold text-[11px] text-[var(--accent-gold)] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Answer (Grounded in Document)
                              </p>
                              <p className="leading-relaxed text-[var(--text-primary)]">{qa.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {qaError && (
                    <p className="text-xs text-rose-400">{qaError}</p>
                  )}

                  <form onSubmit={handleSendQuestion} className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
                    <input
                      type="text"
                      value={qaInput}
                      onChange={(e) => setQaInput(e.target.value)}
                      placeholder="Ask a question about this document..."
                      className="lp-input text-xs flex-1"
                      disabled={isAsking}
                    />
                    <Button
                      type="submit"
                      variant="gold"
                      size="sm"
                      disabled={!qaInput.trim() || isAsking}
                      isLoading={isAsking}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Ask
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete document?">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { if (deleteTarget) deleteDocument(deleteTarget); setDeleteTarget(null); }}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
