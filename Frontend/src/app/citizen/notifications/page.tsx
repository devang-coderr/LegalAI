"use client";
import { useEffect, useState } from "react";
import { Bell, Calendar, FileText, Gavel, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { currentUserId, readBucket, writeBucket } from "@/lib/workspace-store";
import { CITIZEN_BUCKETS, type CitizenNotification } from "@/types/citizen";

const CATEGORY_ICON: Record<CitizenNotification["category"], typeof Bell> = {
  request: UserRound,
  hearing: Calendar,
  case: Gavel,
  document: FileText,
  system: Bell,
};

export default function CitizenNotificationsPage() {
  const [items, setItems] = useState<CitizenNotification[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only localStorage after hydration
    setItems(readBucket<CitizenNotification>(CITIZEN_BUCKETS.notifications, currentUserId()));
  }, []);

  const markAllRead = () => {
    const userId = currentUserId();
    const updated = items.map((n) => ({ ...n, read: true }));
    writeBucket(CITIZEN_BUCKETS.notifications, userId, updated);
    setItems(updated);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Stay informed about case activity, documents, hearings, and legal updates.</p>
        </div>
        {items.some((n) => !n.read) && <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="Updates about your requests, cases, hearings and documents will show up here." className="p-16" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = CATEGORY_ICON[n.category];
            return (
              <Card key={n.id} variant="glass" className={`p-5 ${n.read ? "opacity-70" : ""}`}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-gold-light)] text-[var(--accent-gold)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold">{n.title}</h2>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{n.text}</p>
                    {!n.read && <Badge size="sm" className="mt-3">Unread</Badge>}
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
