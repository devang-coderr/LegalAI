"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Gavel,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { useNotification } from "@/components/ui/ToastProvider";
import { fetchLawyerNotifications, respondToClientRequest as apiRespondToRequest } from "@/services/lawyerMatch.api";
import { currentUserId, readBucket, writeBucket } from "@/lib/workspace-store";
import { LAWYER_BUCKETS, type ClientRequest, type WorkspaceNotification } from "@/types/lawyerNotifications";

const CATEGORY_ICON: Record<WorkspaceNotification["category"], typeof Bell> = {
  hearing: Calendar,
  case: Gavel,
  document: FileText,
  system: Bell,
};

export default function LawyerNotificationsPage() {
  const [tab, setTab] = useState<"requests" | "other">("requests");
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const { showToast } = useNotification();

  const loadData = async () => {
    const res = await fetchLawyerNotifications();
    if (res.success && res.data) {
      if (res.data.clientRequests) {
        setRequests(res.data.clientRequests.filter((r) => r.status === "PENDING"));
      }
      if (res.data.notifications) {
        setNotifications(res.data.notifications as WorkspaceNotification[]);
      }
    } else {
      const userId = currentUserId();
      setRequests(readBucket<ClientRequest>(LAWYER_BUCKETS.clientRequests, userId).filter((r) => r.status === "PENDING"));
      setNotifications(readBucket<WorkspaceNotification>(LAWYER_BUCKETS.notifications, userId));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const respondToRequest = async (request: ClientRequest, accept: boolean) => {
    setRespondingId(request.id);
    const res = await apiRespondToRequest(request.id, accept);
    setRespondingId(null);

    if (res.success) {
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      if (accept) {
        showToast("success", "Client Request Accepted", `${request.clientName} has been added to your Clients and My Cases.`);
      } else {
        showToast("info", "Client Request Declined", `Declined request from ${request.clientName}.`);
      }
    } else {
      showToast("error", "Response Failed", res.error?.message || "Could not process response.");
    }
  };


  const markAllRead = () => {
    const userId = currentUserId();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    writeBucket(LAWYER_BUCKETS.notifications, userId, updated);
    setNotifications(updated);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Client requests and workspace activity, kept clearly separate.
          </p>
        </div>
        {tab === "other" && notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: "requests", label: "Client Requests", count: requests.length },
          { id: "other", label: "Other Notifications", count: notifications.filter((n) => !n.read).length },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as "requests" | "other")}
      />

      {tab === "requests" ? (
        requests.length === 0 ? (
          <EmptyState
            icon={<UserRound className="w-8 h-8" />}
            title="No client requests"
            description="When a citizen asks to connect with you on LegalAI, their request will appear here."
            className="p-16"
          />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Card key={r.id} variant="glass" className="p-5 border-[var(--accent-gold)]/30 bg-[var(--accent-gold-light)]/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)]">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-sm font-bold">New Client Request</h2>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">{r.clientName}</span> wants to connect with you{r.caseType ? ` regarding a ${r.caseType.toLowerCase()} matter` : ""}.
                    </p>
                    {r.summary && <p className="mt-1.5 text-xs text-[var(--text-muted)] italic">&quot;{r.summary}&quot;</p>}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="gold"
                        size="sm"
                        isLoading={respondingId === r.id}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => respondToRequest(r, true)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={respondingId === r.id}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                        onClick={() => respondToRequest(r, false)}
                      >
                        Decline
                      </Button>
                    </div>

                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications"
          description="Hearing reminders, case updates and document activity will show up here."
          className="p-16"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = CATEGORY_ICON[n.category];
            return (
              <Card key={n.id} variant="glass" className={`p-5 ${n.read ? "opacity-70" : ""}`}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-bold">{n.title}</h2>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{n.text}</p>
                    {!n.read && <Badge size="sm" variant="neutral" className="mt-3">Unread</Badge>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
