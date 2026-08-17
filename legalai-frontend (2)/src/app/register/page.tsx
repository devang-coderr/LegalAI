"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from "@/services/auth.api";
import type { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("citizen");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setError("Passwords don't match.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await register({ name, identifier, password, role });
      if (!res.success) throw new Error(res.error ?? "Unable to create your account.");
      router.push(`/${role}`);
    } catch {
      setStatus("error");
      setError("Unable to create your account right now. Please try again.");
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="Legal intelligence, built for how you work."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--azure)] hover:underline">
            Sign in
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
        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email or phone"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {role === "lawyer" && (
          <p className="rounded-lg bg-[var(--azure-soft)] px-3 py-2 text-xs text-[var(--ink-muted)]">
            Lawyer accounts require additional bar verification after sign-up.
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full justify-center" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
