"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Gavel,
  Heart,
  Home,
  ShoppingCart,
  Building2,
  Briefcase,
  Wifi,
  Landmark,
  Copyright,
  ArrowRight,
  ArrowLeft,
  Search,
  UserCheck,
  Languages,
  MapPin,
  BadgeCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Ban,
  FolderOpen,
  Send,
  Loader2,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { findMatchingLawyers, listCitizenRequests, sendClientRequest, cancelClientRequest } from "@/services/lawyerMatch.api";
import { useNotification } from "@/components/ui/ToastProvider";
import type { SentLawyerRequest } from "@/types/citizen";
import type { MatchedLawyer } from "@/types/lawyerMatch";

const EXPERTISE_OPTIONS = [
  { id: "criminal", label: "Criminal Law", icon: Gavel },
  { id: "family", label: "Divorce / Family Law", icon: Heart },
  { id: "property", label: "Property / Land Law", icon: Home },
  { id: "civil", label: "Civil Law", icon: Scale },
  { id: "consumer", label: "Consumer Law", icon: ShoppingCart },
  { id: "corporate", label: "Corporate Law", icon: Building2 },
  { id: "employment", label: "Employment / Labour Law", icon: Briefcase },
  { id: "cyber", label: "Cyber Crime", icon: Wifi },
  { id: "tax", label: "Tax Law", icon: Landmark },
  { id: "ip", label: "Intellectual Property", icon: Copyright },
];

const LANGUAGE_OPTIONS = ["English", "Hindi", "Marathi", "Gujarati", "Bengali"];

const STEPS = ["Expertise", "Description", "Location", "Language"] as const;

const STATUS_META: Record<
  SentLawyerRequest["status"],
  { label: string; icon: typeof Clock3; badgeVariant: "warning" | "success" | "danger" | "neutral" }
> = {
  PENDING: { label: "Pending Review", icon: Clock3, badgeVariant: "warning" },
  ACCEPTED: { label: "Lawyer Accepted", icon: CheckCircle2, badgeVariant: "success" },
  DECLINED: { label: "Declined", icon: XCircle, badgeVariant: "danger" },
  CANCELLED: { label: "Cancelled", icon: Ban, badgeVariant: "neutral" },
};

export default function FindLawyerPage() {
  const router = useRouter();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<"find" | "requests">("find");
  const [step, setStep] = useState(0);
  const [expertise, setExpertise] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "results">("idle");
  const [matches, setMatches] = useState<MatchedLawyer[]>([]);
  const [sentRequests, setSentRequests] = useState<SentLawyerRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Cancel Modal State
  const [requestToCancel, setRequestToCancel] = useState<SentLawyerRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadRequests = async () => {
    setRequestsLoading(true);
    const res = await listCitizenRequests();
    setRequestsLoading(false);
    if (res.success && res.data) {
      setSentRequests(res.data);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = sentRequests.filter((r) => r.status === "PENDING").length;

  const canProceed = [
    !!expertise,
    description.trim().length > 0,
    location.trim().length > 0,
    !!language,
  ][step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    setStatus("loading");
    const response = await findMatchingLawyers({
      expertise: expertise!,
      caseDescription: description,
      location,
      language: language!,
    });
    setMatches(response.success ? response.data : []);
    setStatus("results");
  };

  const handleSendRequest = async (lawyer: MatchedLawyer) => {
    setSendingId(lawyer.id);
    setSendError(null);
    const selectedOption = EXPERTISE_OPTIONS.find((opt) => opt.id === expertise);
    const caseType = selectedOption ? selectedOption.label : (expertise ?? undefined);
    const response = await sendClientRequest(lawyer, { caseType, summary: description });
    setSendingId(null);
    if (response.success && response.data) {
      showToast("success", "Consultation Request Sent", `Your request has been dispatched to ${lawyer.name}.`);
      setSentRequests((prev) => [response.data, ...prev.filter((r) => r.id !== response.data.id)]);
      setActiveTab("requests");
      resetSearch();
    } else {
      const msg = response.error?.message || "Unable to send this request right now.";
      setSendError(msg);
      showToast("error", "Request Failed", msg);
    }
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    setCancelling(true);
    const res = await cancelClientRequest(requestToCancel.id);
    setCancelling(false);
    if (res.success) {
      showToast("info", "Request Cancelled", "Your consultation request has been cancelled.");
      setSentRequests((prev) =>
        prev.map((r) => (r.id === requestToCancel.id ? { ...r, status: "CANCELLED" as const } : r))
      );
      setRequestToCancel(null);
    } else {
      showToast("error", "Cancellation Failed", res.error?.message || "Could not cancel request.");
    }
  };

  const resetSearch = () => {
    setStep(0);
    setExpertise(null);
    setDescription("");
    setLocation("");
    setLanguage(null);
    setStatus("idle");
    setMatches([]);
    setSendError(null);
  };

  return (
    <div className="text-[var(--text-primary)] space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)]">
            Verified Legal Counsel
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Match with registered advocates for your matters and track your consultation requests.
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 shrink-0">
          <button
            onClick={() => setActiveTab("find")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "find"
                ? "bg-[var(--accent-gold)] text-black shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Find Lawyer
          </button>
          <button
            onClick={() => {
              setActiveTab("requests");
              loadRequests();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "requests"
                ? "bg-[var(--accent-gold)] text-black shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            My Requests
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "requests" ? (
        /* Requests History View */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">Consultation Requests History</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetSearch();
                setActiveTab("find");
              }}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            >
              New Lawyer Search
            </Button>
          </div>

          {requestsLoading ? (
            <Card variant="glass" className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[var(--accent-gold)] mx-auto animate-spin" />
              <p className="text-xs text-[var(--text-secondary)]">Loading your consultation requests…</p>
            </Card>
          ) : sentRequests.length === 0 ? (
            <EmptyState
              icon={<Send className="w-8 h-8" />}
              title="No consultation requests sent yet"
              description="When you reach out to verified advocates on LegalAI, your matter requests and their live response statuses will appear here."
              actionLabel="Find an Advocate"
              onAction={() => setActiveTab("find")}
              className="p-16"
            />
          ) : (
            <div className="space-y-4">
              {sentRequests.map((req) => {
                const meta = STATUS_META[req.status] || STATUS_META.PENDING;
                const StatusIcon = meta.icon;
                return (
                  <Card key={req.id} variant="glass" className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1.5 flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold font-serif text-[var(--text-primary)]">
                            Adv. {req.lawyerName || "Legal Advocate"}
                          </h3>
                          <Badge variant={meta.badgeVariant} size="sm">
                            <StatusIcon className="w-3 h-3 mr-1 inline" />
                            {meta.label}
                          </Badge>
                          {req.caseType && (
                            <Badge variant="neutral" size="sm">
                              {req.caseType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">Matter summary: </span>
                          {req.summary}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Sent on {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRequestToCancel(req)}
                            className="text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
                          >
                            Cancel Request
                          </Button>
                        )}
                        {req.status === "ACCEPTED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
                            onClick={() => router.push("/citizen/cases")}
                          >
                            View Case
                          </Button>
                        )}
                        {(req.status === "DECLINED" || req.status === "CANCELLED") && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              resetSearch();
                              setActiveTab("find");
                            }}
                          >
                            Find Another Lawyer
                          </Button>
                        )}
                      </div>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300/90 flex items-center gap-2">
                        <Clock3 className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Your request has been delivered to the advocate. Waiting for review and response.</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : status === "results" ? (
        /* Search Results View */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif">
              Matching Advocates ({matches.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={resetSearch}>
              Start New Search
            </Button>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="w-8 h-8" />}
              title="No matching advocates found"
              description="We couldn't find a registered advocate matching your specific location/expertise right now. Try adjusting your criteria or check back soon."
              actionLabel="Adjust Criteria"
              onAction={resetSearch}
              className="p-16"
            />
          ) : (
            <>
              {sendError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {sendError}
                </div>
              )}
              {matches.map((lawyer) => (
                <Card key={lawyer.id} variant="glass" className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-serif">{lawyer.name}</h3>
                        <Badge variant="neutral" size="sm">
                          <FileCheck className="w-3 h-3 mr-1 inline" />
                          Registered Advocate
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lawyer.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          {lawyer.languages.join(", ")}
                        </span>
                        <span>{lawyer.experienceYears} yrs experience</span>
                        <span>• {lawyer.barCouncil}</span>
                      </div>
                      {lawyer.expertise && lawyer.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {lawyer.expertise.map((exp, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      isLoading={sendingId === lawyer.id}
                      onClick={() => handleSendRequest(lawyer)}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Client Request
                    </Button>
                  </div>
                </Card>
              ))}
            </>
          )}
        </motion.div>
      ) : status === "loading" ? (
        <Card variant="glass" className="p-10 text-center space-y-3">
          <Search className="w-8 h-8 text-[var(--accent-gold)] mx-auto animate-pulse" />
          <p className="text-sm text-[var(--text-secondary)]">Finding matching registered advocates…</p>
        </Card>
      ) : (
        /* Wizard View */
        <>
          {/* Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 space-y-1.5">
                <div
                  className={`h-1 rounded-full ${
                    i <= step ? "bg-[var(--accent-gold)]" : "bg-[var(--border-color)]"
                  }`}
                />
                <p
                  className={`text-[10px] uppercase tracking-wide ${
                    i === step ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              <Card variant="glass" className="p-6 sm:p-8 space-y-5">
                {step === 0 && (
                  <>
                    <h2 className="text-lg font-bold font-serif">What type of legal help do you need?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {EXPERTISE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setExpertise(opt.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${
                            expertise === opt.id
                              ? "border-[var(--accent-gold)] bg-[var(--accent-gold-light)]"
                              : "border-[var(--border-color)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          <opt.icon
                            className={`w-5 h-5 ${
                              expertise === opt.id ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"
                            }`}
                          />
                          <span className="text-xs font-medium text-[var(--text-primary)]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2 className="text-lg font-bold font-serif">Tell us about your legal issue</h2>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your legal matter in detail (e.g. My employer withheld 2 months salary without notice...)"
                      className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-lg font-bold font-serif">Where do you need legal assistance?</h2>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                      className="w-full p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-lg font-bold font-serif">What language do you prefer to communicate in?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`p-3.5 rounded-xl border text-sm font-medium transition-colors ${
                            language === lang
                              ? "border-[var(--accent-gold)] bg-[var(--accent-gold-light)] text-[var(--accent-gold)]"
                              : "border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    disabled={!canProceed}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {step === STEPS.length - 1 ? "Find Matching Advocates" : "Continue"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Cancel Request Confirmation Modal */}
      <Modal
        isOpen={!!requestToCancel}
        onClose={() => setRequestToCancel(null)}
        title="Cancel Consultation Request?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to cancel your consultation request to{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              Adv. {requestToCancel?.lawyerName}
            </span>{" "}
            regarding{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              &quot;{requestToCancel?.summary?.slice(0, 60)}...&quot;
            </span>
            ?
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            This action will move the request to Cancelled status. It will remain in your request history.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
            <Button variant="secondary" size="sm" onClick={() => setRequestToCancel(null)}>
              Keep Request
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelling}
              onClick={handleConfirmCancel}
            >
              Cancel Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
