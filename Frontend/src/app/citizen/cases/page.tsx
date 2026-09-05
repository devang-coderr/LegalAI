"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useMyCases } from "@/hooks/useMyCases";
import { statusToBadgeVariant } from "@/lib/case-status";
import {
  FileText,
  Calendar,
  User,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Search,
  FolderOpen,
  Eye,
  Download,
  Unlink,
  Link as LinkIcon,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { Case } from "@/types/case";
import { ManagedDocument } from "@/types/document";
import { attachDocumentToCase, listCaseDocuments, listUserDocuments } from "@/services/document.api";
import { useNotification } from "@/components/ui/ToastProvider";

export default function MyCasesPage() {
  const router = useRouter();
  const { cases, isLoading, error, reload } = useMyCases();
  const { showToast } = useNotification();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Case Documents Modal State
  const [activeCaseForDocs, setActiveCaseForDocs] = useState<Case | null>(null);
  const [caseDocs, setCaseDocs] = useState<ManagedDocument[]>([]);
  const [caseDocsLoading, setCaseDocsLoading] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<ManagedDocument[]>([]);
  const [selectedDocToAttach, setSelectedDocToAttach] = useState<string>("");
  const [isAttaching, setIsAttaching] = useState(false);

  const loadCaseDocs = async (caseId: string) => {
    setCaseDocsLoading(true);
    const [caseRes, userDocsRes] = await Promise.all([
      listCaseDocuments(caseId),
      listUserDocuments(),
    ]);
    setCaseDocsLoading(false);

    if (caseRes.success && caseRes.data) {
      setCaseDocs(caseRes.data);
    } else {
      setCaseDocs([]);
    }

    if (userDocsRes.success && userDocsRes.data) {
      // Find standalone documents or documents attached to other cases
      const standalone = userDocsRes.data.filter((d) => d.caseId !== caseId);
      setAvailableDocs(standalone);
    }
  };

  const handleOpenDocsModal = (caseItem: Case) => {
    setActiveCaseForDocs(caseItem);
    setSelectedDocToAttach("");
    loadCaseDocs(caseItem.id);
  };

  const handleDetachDoc = async (docId: string) => {
    const res = await attachDocumentToCase(docId, null);
    if (res.success) {
      showToast("success", "Document Detached", "Document is now standalone in My Documents.");
      if (activeCaseForDocs) loadCaseDocs(activeCaseForDocs.id);
    } else {
      showToast("error", "Error", res.error?.message || "Could not detach document.");
    }
  };

  const handleAttachExistingDoc = async () => {
    if (!activeCaseForDocs || !selectedDocToAttach) return;
    setIsAttaching(true);
    const res = await attachDocumentToCase(selectedDocToAttach, activeCaseForDocs.id);
    setIsAttaching(false);
    if (res.success) {
      showToast("success", "Document Attached", `Document attached to ${activeCaseForDocs.title}`);
      setSelectedDocToAttach("");
      loadCaseDocs(activeCaseForDocs.id);
    } else {
      showToast("error", "Error", res.error?.message || "Could not attach document.");
    }
  };

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => {
        if (filterStatus !== "all" && c.status !== filterStatus) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      }),
    [cases, filterStatus, searchQuery]
  );

  const statuses = useMemo(() => {
    const unique = Array.from(new Set(cases.map((c) => c.status)));
    return ["all", ...unique];
  }, [cases]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] py-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">My Cases</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage all your legal cases in one place.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={reload} />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-8 h-8" />}
            title="No cases yet"
            description="Cases you create with LegalAI, or connect with an advocate on, will appear here."
            actionLabel="Start Case Intelligence"
            onAction={() => router.push("/citizen/case-intelligence")}
            className="p-16"
          />
        ) : (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/30"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/30 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s === "all" ? "All Cases" : s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cases List */}
            <div className="space-y-4">
              {filteredCases.map((case_, index) => (
                <motion.div key={case_.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="p-6 hover:bg-[var(--bg-surface)] transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-3 bg-[var(--accent-gold-light)] rounded-lg">
                            <FileText className="w-5 h-5 text-[var(--accent-gold)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold">{case_.title}</h3>
                              <Badge variant={statusToBadgeVariant(case_.status)} size="sm">{case_.status}</Badge>
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">Case #{case_.id}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--text-muted)] mb-1">Assigned Lawyer</p>
                            <p className="font-medium flex items-center gap-2 text-[var(--accent-gold)]">
                              <User className="w-4 h-4 shrink-0" />
                              {case_.assignedLawyer ? `Adv. ${case_.assignedLawyer}` : "Counsel Assigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)] mb-1">Court / Jurisdiction</p>
                            <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" />{case_.court}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)] mb-1">Case Type</p>
                            <p className="font-medium">{case_.caseType || "Civil Dispute"}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)] mb-1">Next Hearing</p>
                            <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0" />{case_.nextHearingDate || "Not scheduled"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<FolderOpen className="w-4 h-4" />}
                          onClick={() => handleOpenDocsModal(case_)}
                        >
                          Documents
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {filteredCases.length === 0 && (
                <Card className="p-12 text-center">
                  <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cases match your filters</h3>
                  <Button variant="primary" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
                    Clear Filters
                  </Button>
                </Card>
              )}
            </div>

          </>
        )}
      </div>

      {/* Case Documents Modal */}
      <Modal
        isOpen={!!activeCaseForDocs}
        onClose={() => setActiveCaseForDocs(null)}
        title={`Documents — ${activeCaseForDocs?.title || "Case"}`}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border-color)] pb-3">
            <span>Case #{activeCaseForDocs?.id.slice(0, 8)}</span>
            <span>{caseDocs.length} {caseDocs.length === 1 ? "document" : "documents"} attached</span>
          </div>

          {/* List of Case Documents */}
          {caseDocsLoading ? (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-gold)] mx-auto" />
              <p className="text-xs text-[var(--text-secondary)]">Loading case documents…</p>
            </div>
          ) : caseDocs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <FolderOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No documents attached to this case</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Attach documents from your document repository below or from the My Documents page.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {caseDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-[var(--accent-gold-light)] text-[var(--accent-gold)] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{doc.fileName}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{doc.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <a
                      href={doc.objectUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="View"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-card)] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={doc.objectUrl}
                      download={doc.fileName}
                      title="Download"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-card)] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDetachDoc(doc.id)}
                      title="Detach from case"
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attach Existing Document Section */}
          {availableDocs.length > 0 && (
            <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                Attach from My Documents
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedDocToAttach}
                  onChange={(e) => setSelectedDocToAttach(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                >
                  <option value="">Select a document to attach…</option>
                  {availableDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fileName} ({d.category})
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedDocToAttach}
                  isLoading={isAttaching}
                  onClick={handleAttachExistingDoc}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Attach
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCaseForDocs(null);
                router.push("/citizen/documents");
              }}
              leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
            >
              Go to Document Vault
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveCaseForDocs(null)} leftIcon={<X className="w-3.5 h-3.5" />}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
