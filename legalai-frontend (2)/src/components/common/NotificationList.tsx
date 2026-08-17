import { Calendar, FileText, Search, Bell, Users, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/common/EmptyState";
import type { AppNotification, NotificationType } from "@/types/document";

const ICONS: Record<NotificationType, typeof Calendar> = {
  hearing: Calendar,
  consultation: Users,
  document: FileText,
  research: Search,
  case_update: RefreshCcw,
  system: Bell,
};

export function NotificationList({ notifications }: { notifications: AppNotification[] }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="You're all caught up"
        description="New updates about your cases, documents, and hearings will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        return (
          <Card key={n.id} glow={false} className="flex items-start gap-3 py-4">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                n.read ? "bg-[var(--surface)] text-[var(--ink-faint)]" : "bg-[var(--azure-soft)] text-[var(--azure)]"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--ink)]">{n.title}</p>
                <span className="shrink-0 text-xs text-[var(--ink-faint)]">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{n.description}</p>
            </div>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--azure)]" />}
          </Card>
        );
      })}
    </div>
  );
}
