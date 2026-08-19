"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const logout = () => {
    if (!window.confirm("Are you sure you want to log out of LegalAI?")) return;
    clearSession();
    router.replace("/");
  };

  return (
    <button
      type="button"
      onClick={logout}
      className={compact
        ? "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
        : "workspace-nav-item w-full text-left text-rose-300 hover:bg-rose-500/10"}
    >
      <LogOut className="h-[17px] w-[17px]" />
      <span>Logout</span>
    </button>
  );
}
