import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff, Check, CheckCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import {
  clearNotifications,
  getNotifications,
  markAllRead,
  markNotificationRead,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const user = useAuth();
  const qc = useQueryClient();
  const items = useStore<Awaited<ReturnType<typeof getNotifications>>>(
    ["notifications", user?.id],
    () => (user ? getNotifications(user.id) : Promise.resolve([])),
    [],
  );

  if (!user) return null;

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reminders and nudges to keep your study routine on track."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await markAllRead(user.id);
                qc.invalidateQueries({ queryKey: ["notifications", user.id] });
              }}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!confirm("Clear all notifications?")) return;
                await clearNotifications(user.id);
                qc.invalidateQueries({ queryKey: ["notifications", user.id] });
              }}
              disabled={items.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <span className="h-12 w-12 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
            <BellOff className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold">You're all caught up</h3>
          <p className="text-sm text-muted-foreground mt-1">
            New reminders and updates will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-2xl border p-4 flex items-start gap-3 bg-card",
                !n.read && "ring-1 ring-primary/30",
              )}
            >
              <span
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                  n.type === "warning"
                    ? "bg-warning/15 text-warning"
                    : n.type === "reminder"
                      ? "bg-primary-soft text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Bell className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={async () => {
                    await markNotificationRead(user.id, n.id);
                    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
                  }}
                  className="text-muted-foreground hover:text-primary p-1"
                  aria-label="Mark read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
