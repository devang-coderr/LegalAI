"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/services/auth.api";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get("role") as UserRole) ?? "citizen";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await login({ identifier, password });
      if (!res.success) throw new Error(res.error ?? "Unable to sign in. Try again.");
      router.push(`/${role}`);
    } catch {
      setStatus("error");
      setError("Unable to sign in right now. Please try again.");
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to LegalAI"
      subtitle="Continue where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-medium text-[var(--azure)] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)]/60 p-1">
        {(["citizen", "lawyer"] as UserRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-full py-2 text-xs font-medium capitalize transition-all duration-300",
              role === r
                ? "bg-[var(--azure)] text-white shadow-[var(--shadow-glow-azure)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or phone"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-[var(--ink-muted)] hover:text-[var(--azure)]">
            Forgot password?
          </Link>
        </div>

        {status === "error" && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full justify-center" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            `Continue as ${role === "citizen" ? "Citizen" : "Lawyer"}`
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
