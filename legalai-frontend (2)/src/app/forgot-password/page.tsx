"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="We'll send a reset link to your email or phone."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-[var(--azure)] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <p className="text-sm text-[var(--ink)]">Check your inbox</p>
          <p className="text-xs text-[var(--ink-muted)]">
            If an account exists for {identifier || "that address"}, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4"
        >
          <Input
            label="Email or phone"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button type="submit" className="w-full justify-center">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
