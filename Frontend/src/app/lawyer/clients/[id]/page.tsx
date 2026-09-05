"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Download,
  Eye,
  FileText,
  Mail,
  NotebookPen,
  Phone,
  Plus,
  Scale,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FileUploader } from "@/components/ui/FileUploader";
import { statusToBadgeVariant } from "@/lib/case-status";
import { useLawyerClients } from "@/hooks/useLawyerClients";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { useLawyerDocuments } from "@/hooks/useLawyerDocuments";
import { useResearchNotes } from "@/hooks/useResearchNotes";
import { LAWYER_DOCUMENT_TYPES, type LawyerDocumentType } from "@/types/lawyer";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = String(params?.id || "");

  const { clients, isLoading: clientsLoading } = useLawyerClients();
  const { cases } = useLawyerCases();
  const client = clients.find((c) => c.id === clientId);
  const clientCases = cases.filter((c) => c.clientId === clientId);
  const nextHearing = clientCases.map((c) => c.nextHearingDate).filter(Boolean).sort()[0];

  const [tab, setTab] = useState<"cases" | "documents" | "notes">("cases");

  if (clientsLoading) return <CardSkeleton />;

  if (!client) {
    return (
      <EmptyState
        title="Client not found"
        description="This client may have been removed, or the link is out of date."
        actionLabel="Back to Clients"
        onAction={() => router.push("/lawyer/clients")}
        className="p-16"
      />
    );
  }

  return (
    <div className="space-y-8 py-4">
      <Card variant="glass" className="p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold">{client.name}</h1>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Client since {new Date(client.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <Badge variant={client.source === "CLIENT_REQUEST" ? "success" : "neutral"}>
            {client.source === "CLIENT_REQUEST" ? "From client request" : "Manually added"}
          </Badge>
        </div>

        <div className="grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon={Mail} label="Email" value={client.email || "Not provided"} />
          <InfoTile icon={Phone} label="Phone" value={client.phone} />
          <InfoTile icon={Scale} label="Linked cases" value={`${clientCases.length} matter${clientCases.length === 1 ? "" : "s"}`} />
          <InfoTile icon={Calendar} label="Next hearing" value={nextHearing || "—"} />
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: "cases", label: "View Cases", count: clientCases.length },
          { id: "documents", label: "Documents" },
          { id: "notes", label: "Research Notes" },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      {tab === "cases" && <CasesTab cases={clientCases} />}
      {tab === "documents" && <DocumentsTab clientId={client.id} caseOptions={clientCases} />}
      {tab === "notes" && <NotesTab clientId={client.id} />}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] p-4">
      <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className="text-xs font-semibold truncate">{value}</p>
    </div>
  );
}

function CasesTab({ cases }: { cases: ReturnType<typeof useLawyerCases>["cases"] }) {
  if (cases.length === 0) {
    return <EmptyState icon={<Scale className="w-8 h-8" />} title="No cases linked to this client yet." className="p-12" />;
  }
  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <Card key={c.id} variant="glass" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusToBadgeVariant(c.status)} size="sm">{c.status.replace("_", " ")}</Badge>
              {c.caseNumber && <span className="text-[10px] text-[var(--text-muted)]">{c.caseNumber}</span>}
            </div>
            <h3 className="text-sm font-bold font-serif mt-1">{c.title}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{c.court}{c.caseType ? ` · ${c.caseType}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-amber-400">{c.nextHearingDate || "No hearing set"}</span>
            <Link href={`/lawyer/cases/${c.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Open Case</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

function DocumentsTab({ clientId, caseOptions }: { clientId: string; caseOptions: ReturnType<typeof useLawyerCases>["cases"] }) {
  const { documentsForClient, uploadDocument, deleteDocument } = useLawyerDocuments();
  const docs = documentsForClient(clientId);
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<string>(caseOptions[0]?.id || "");
  const [docType, setDocType] = useState<LawyerDocumentType>("Pleading");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleFile = (file: File) => {
    uploadDocument(file, { clientId, caseId: caseId || undefined, documentType: docType });
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gold" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents yet"
          description="Upload a document to keep this client's matter organized."
          actionLabel="Upload Document"
          onAction={() => setModalOpen(true)}
          className="p-12"
        />
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.id} variant="glass" className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{d.fileName}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge size="sm" variant="neutral">{d.documentType}</Badge>
                  <span className="text-[10px] text-[var(--text-muted)]">{formatSize(d.sizeBytes)}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={d.objectUrl} target="_blank" rel="noreferrer" title="View" aria-label={`View ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)]"><Eye className="w-3.5 h-3.5" /></a>
                <a href={d.objectUrl} download={d.fileName} title="Download" aria-label={`Download ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-secondary)]"><Download className="w-3.5 h-3.5" /></a>
                <button onClick={() => setDeleteTarget(d.id)} title="Delete" aria-label={`Delete ${d.fileName}`} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Case</span>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="lp-input">
              <option value="">Not linked to a specific case</option>
              {caseOptions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Document Type</span>
            <select value={docType} onChange={(e) => setDocType(e.target.value as LawyerDocumentType)} className="lp-input">
              {LAWYER_DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <FileUploader onFileSelect={handleFile} acceptedFormats=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        </div>
      </Modal>

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

function NotesTab({ clientId }: { clientId: string }) {
  const { notes, addNote, editNote, removeNote } = useResearchNotes(clientId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const openNew = () => { setEditingId(null); setTitle(""); setContent(""); setModalOpen(true); };
  const openEdit = (id: string, t: string, c: string) => { setEditingId(id); setTitle(t); setContent(c); setModalOpen(true); };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    if (editingId) await editNote(editingId, title.trim(), content.trim());
    else await addNote(title.trim(), content.trim());
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openNew}>Add Research Note</Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={<NotebookPen className="w-8 h-8" />} title="No research notes yet." actionLabel="Add Research Note" onAction={openNew} className="p-12" />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id} variant="glass" className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold font-serif">{n.title}</h3>
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(n.id, n.title, n.content)}>Edit</Button>
                  <button onClick={() => removeNote(n.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10" aria-label={`Delete note ${n.title}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Research Note" : "Add Research Note"}>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Note title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="lp-input" placeholder="e.g. Limitation period check" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Content</span>
            <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="lp-input resize-none" placeholder="Write your note…" />
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" size="sm" onClick={handleSave}>Save Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
