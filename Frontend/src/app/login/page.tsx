"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Lock, Mail, Scale, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { clearSession, type UserRole } from "@/lib/auth";
import { loginApi } from "@/services/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("CITIZEN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.search.includes("role=lawyer")) setRole("LAWYER");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
  const res = await loginApi(email, password, role);

  if (res.success && res.data) {
    const u = res.data.user;
    router.replace(u.role === "LAWYER" ? "/lawyer" : "/citizen");
  } else {
    clearSession();

    if (typeof window !== "undefined") {
      localStorage.removeItem("legalai-token");
    }

    setErrorMessage(
      res.error?.message ||
      res.message ||
      "Unable to sign in. Please check your credentials."
    );
  }
} catch {
  clearSession();

  if (typeof window !== "undefined") {
    localStorage.removeItem("legalai-token");
  }

  setErrorMessage(
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

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center py-10"
      >
        <Card variant="glass" className="w-full space-y-6 p-7 sm:p-8 shadow-2xl">
          <div className="text-center space-y-2">
            <Badge variant={role === "CITIZEN" ? "blue" : "violet"}>
              {role === "CITIZEN" ? "Citizen Authentication" : "Verified Advocate Portal"}
            </Badge>
            <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
            <p className="text-xs text-[var(--text-secondary)]">Access your personalized LegalAI workspace.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1.5">
            {(["CITIZEN", "LAWYER"] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold ${
                  role === item ? "bg-[var(--accent-blue)] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                {item === "CITIZEN" ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                {item === "CITIZEN" ? "Citizen" : "Lawyer"}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold">Email or username</span>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "LAWYER" ? "lawyer@legalai.in" : "citizen@legalai.in"}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold">Password</span>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </label>

            {role === "LAWYER" && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-[var(--text-secondary)]">
                Only verified lawyer accounts can enter the professional workspace. New registrations remain pending until identity documents are reviewed.
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Sign in to {role === "LAWYER" ? "Lawyer Workspace" : "Citizen Portal"}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            New here?{" "}
            <Link href="/register" className="font-semibold text-[var(--accent-blue)]">
              Create account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
