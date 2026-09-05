"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, FileCheck, FileText, Lock, Mail, MapPin, Scale, ShieldCheck, User, AlertCircle, Phone, Landmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { makeInitials, setSession, type UserRole } from "@/lib/auth";
import { registerApi } from "@/services/auth.api";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("CITIZEN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [barCouncil, setBarCouncil] = useState("Bar Council of Maharashtra & Goa");
  const [barNumber, setBarNumber] = useState("");
  const [court, setCourt] = useState("");
  const [location, setLocation] = useState("");
  const [govId, setGovId] = useState<File | null>(null);
  const [enrolmentCert, setEnrolmentCert] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerApi({
        name,
        email,
        phone: phone.trim() || undefined,
        password,
        role,
        barCouncil: role === "LAWYER" ? barCouncil : undefined,
        barNumber: role === "LAWYER" ? barNumber : undefined,
        court: role === "LAWYER" ? court.trim() || undefined : undefined,
        location: role === "LAWYER" ? location.trim() || undefined : undefined,
      });

      if (role === "LAWYER") {
        localStorage.setItem(
          "legalai-verification-documents",
          JSON.stringify({
            governmentId: govId?.name || "",
            enrollmentCertificate: enrolmentCert?.name || "",
            submittedAt: new Date().toISOString(),
          })
        );
      }

      if (res.success && res.data) {
        router.replace(role === "LAWYER" ? "/lawyer/verification" : "/citizen");
      } else {
        setErrorMessage(
          res.error?.message ||
          res.message ||
          "Registration failed. Please check your details."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
        "Unable to connect to the LegalAI backend. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] p-4 sm:p-8 text-[var(--text-primary)]">
      <div className="auth-backdrop" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-blue)] text-white">
            <Scale className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-bold">LegalAI</span>
        </Link>
        <ThemeToggle />
      </header>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto w-full max-w-2xl py-8 sm:py-10">
        <Card variant="glass" className="space-y-6 p-6 sm:p-8">
          <div className="text-center space-y-2">
            <Badge variant={role === "CITIZEN" ? "blue" : "violet"}>
              {role === "LAWYER" ? "Lawyer identity details" : "Citizen registration"}
            </Badge>
            <h1 className="font-serif text-3xl font-bold">Create your LegalAI account</h1>
            <p className="text-xs text-[var(--text-secondary)]">Your role determines which workspace and verification flow you receive.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1.5">
            {(["CITIZEN", "LAWYER"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold ${
                  role === r ? "bg-[var(--accent-blue)] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                {r === "CITIZEN" ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                {r === "CITIZEN" ? "Citizen" : "Lawyer / Advocate"}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold">Full legal name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                  placeholder="Your full name"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
            </div>

            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold">Phone number (Optional)</span>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
            </label>

            {role === "LAWYER" && (
              <div className="space-y-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-purple-300" />
                  <div>
                    <h2 className="font-semibold">Professional identity check</h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      For statutory compliance, we collect your State Bar Council details, enrollment information, and primary practice jurisdiction.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold">State Bar Council</span>
                    <select
                      value={barCouncil}
                      onChange={(e) => setBarCouncil(e.target.value)}
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    >
                      <option>Bar Council of Maharashtra & Goa</option>
                      <option>Bar Council of Delhi</option>
                      <option>Bar Council of Karnataka</option>
                      <option>Bar Council of Madhya Pradesh</option>
                      <option>Bar Council of Punjab & Haryana</option>
                      <option>Bar Council of Tamil Nadu & Puducherry</option>
                      <option>Other State Bar Council</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold">Enrollment number</span>
                    <div className="relative">
                      <FileCheck className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        required
                        value={barNumber}
                        onChange={(e) => setBarNumber(e.target.value)}
                        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                        placeholder="STATE/1234/2024"
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold">Primary Court / Jurisdiction</span>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        value={court}
                        onChange={(e) => setCourt(e.target.value)}
                        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                        placeholder="e.g. Bombay High Court, District Court"
                      />
                    </div>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold">City / Location</span>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                        placeholder="e.g. Mumbai, Pune, Nagpur"
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block cursor-pointer rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <FileText className="h-4 w-4 text-[var(--accent-blue)]" />
                      Government ID / Aadhar
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setGovId(e.target.files?.[0] || null)}
                      className="mt-3 w-full text-xs"
                    />
                    {govId && <p className="mt-2 text-[10px] text-emerald-400">✓ {govId.name}</p>}
                  </label>
                  <label className="block cursor-pointer rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <FileCheck className="h-4 w-4 text-[var(--accent-blue)]" />
                      Enrollment certificate
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setEnrolmentCert(e.target.files?.[0] || null)}
                      className="mt-3 w-full text-xs"
                    />
                    {enrolmentCert && <p className="mt-2 text-[10px] text-emerald-400">✓ {enrolmentCert.name}</p>}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-[10px] text-[var(--text-secondary)]">
                  <div className="rounded-lg bg-[var(--bg-card)] p-3">
                    <ShieldCheck className="mb-1 h-4 w-4 text-emerald-400" />
                    Identity details
                  </div>
                  <div className="rounded-lg bg-[var(--bg-card)] p-3">
                    <FileCheck className="mb-1 h-4 w-4 text-amber-400" />
                    Bar enrollment
                  </div>
                  <div className="rounded-lg bg-[var(--bg-card)] p-3">
                    <MapPin className="mb-1 h-4 w-4 text-blue-400" />
                    Jurisdiction & City
                  </div>
                </div>
              </div>
            )}

            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold">Password</span>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                  placeholder="At least 6 characters"
                />
              </div>
            </label>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {role === "LAWYER" ? "Submit for lawyer verification" : "Create citizen account"}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent-blue)]">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
