"use client";

import React from "react";
import { CitizenSidebar } from "@/components/layout/CitizenSidebar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CinematicBackground } from "@/components/layout/CinematicBackground";
import { WorkspaceGuard } from "@/components/auth/WorkspaceGuard";
import { SessionHeader } from "@/components/auth/SessionHeader";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WorkspaceGuard role="CITIZEN">
        <div className="workspace-shell citizen-typography">
          <CinematicBackground className="workspace-atmosphere" />
          <CitizenSidebar />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            <SessionHeader role="CITIZEN" />
            <main className="relative z-10 mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-1 p-4 sm:p-8">{children}</main>
          </div>
        </div>
      </WorkspaceGuard>
    </ToastProvider>
  );
}
