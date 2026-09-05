"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, type UserRole } from "@/lib/auth";

export function WorkspaceGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== role) {
      router.replace(`/login?role=${role.toLowerCase()}`);
      return;
    }
    if (
      role === "LAWYER" &&
      session.verificationStatus !== "VERIFIED" &&
      pathname !== "/lawyer/verification" &&
      pathname !== "/lawyer/settings"
    ) {
      router.replace("/lawyer/verification");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates render until the client-only auth check runs
    setReady(true);
  }, [pathname, role, router]);

  if (!ready) return <div className="min-h-screen bg-[var(--bg-primary)]" />;
  return <>{children}</>;
}
