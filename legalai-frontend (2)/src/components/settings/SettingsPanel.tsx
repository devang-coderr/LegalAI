"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { UserRole } from "@/types/auth";

export function SettingsPanel({ role }: { role: UserRole }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card glow={false}>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Profile</h2>
        <form onSubmit={handleSave}>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Full name" defaultValue={role === "citizen" ? "Demo Citizen" : "Adv. Demo Lawyer"} />
            <Input label="Email" type="email" defaultValue="demo@legalai.app" />
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <Button type="submit" variant="ghost" className="px-4 py-2 text-xs">Save changes</Button>
          </div>
        </form>
      </Card>

      <Card glow={false}>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--ink)]">Theme</p>
            <p className="text-xs text-[var(--ink-muted)]">Switch between light and dark mode.</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card glow={false}>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Notification preferences</h2>
        <div className="mt-4 space-y-3 text-sm">
          {["Hearing reminders", "Document processing updates", "Research digests"].map((pref) => (
            <label key={pref} className="flex items-center justify-between text-[var(--ink-muted)]">
              {pref}
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--azure)]" />
            </label>
          ))}
        </div>
      </Card>

      <Card glow={false} className="border-red-500/20">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Account</h2>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Sign out of your LegalAI account on this device.
        </p>
        <Button
          variant="ghost"
          className="mt-4 px-4 py-2 text-xs text-red-400 hover:border-red-400/40 hover:bg-red-500/10"
          onClick={() => router.push("/")}
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </Button>
      </Card>
    </div>
  );
}
