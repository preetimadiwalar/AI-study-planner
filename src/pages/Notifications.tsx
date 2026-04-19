import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CheckCheck,
  CircleAlert,
  ClipboardList,
  Clock,
  RefreshCw,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type NotificationType = "study" | "exam" | "task" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  // Study Reminders
  {
    id: "s1",
    type: "study",
    title: "Study session: Mathematics",
    message: "Your scheduled 2-hour deep focus block for calculus starts in 30 minutes. Clear your workspace and stay focused.",
    time: "In 30 minutes",
    isRead: false,
  },
  {
    id: "s2",
    type: "study",
    title: "Study session: Physics",
    message: "Join the group review for Physics formulas and sample problems. Covers kinematics and thermodynamics.",
    time: "Tomorrow, 9:00 AM",
    isRead: false,
  },
  {
    id: "s3",
    type: "study",
    title: "Study session: Chemistry",
    message: "Your AI planner suggests a 1-hour organic chemistry revision based on your weak areas this week.",
    time: "Today, 4:00 PM",
    isRead: true,
  },

  // Exam Reminders
  {
    id: "e1",
    type: "exam",
    title: "Exam reminder: Final Mathematics Exam",
    message: "Your Mathematics final exam is in 3 days. AI recommends revising integration, limits, and matrix operations.",
    time: "In 3 days",
    isRead: false,
  },
  {
    id: "e2",
    type: "exam",
    title: "Exam reminder: Physics Mid-Term",
    message: "Physics Mid-Term scheduled for next Monday. Focus on electrostatics and wave optics for the remaining sessions.",
    time: "In 6 days",
    isRead: false,
  },
  {
    id: "e3",
    type: "exam",
    title: "Exam reminder: Chemistry Lab Practical",
    message: "Lab practical exam next week. Ensure all your experiment reports are submitted and viva topics reviewed.",
    time: "In 8 days",
    isRead: true,
  },

  // Pending Tasks
  {
    id: "t1",
    type: "task",
    title: "Complete Mathematics assignment",
    message: "Submit Mathematics assignment before midnight to keep your study plan balanced. 3 problems remaining.",
    time: "Today, 6:00 PM",
    isRead: false,
  },
  {
    id: "t2",
    type: "task",
    title: "Review Physics formulas",
    message: "You have 12 flashcards marked for review. Spending 20 minutes now will boost retention significantly.",
    time: "Today, 8:00 PM",
    isRead: false,
  },
  {
    id: "t3",
    type: "task",
    title: "Submit Chemistry lab report",
    message: "Your Chemistry lab report draft is incomplete. Complete the results section and submit before the deadline.",
    time: "Tomorrow, 12:00 PM",
    isRead: true,
  },

  // System Notifications
  {
    id: "sys1",
    type: "system",
    title: "AI planner sync completed",
    message: "Refresh your planner to lock in your updated study cycle. 4 sessions were rescheduled based on your progress.",
    time: "In 2 hours",
    isRead: false,
  },
  {
    id: "sys2",
    type: "system",
    title: "New study plan generated",
    message: "Your AI assistant has generated a new 4-week study plan for your upcoming exams. Review and approve it now.",
    time: "Today, 10:00 AM",
    isRead: false,
  },
  {
    id: "sys3",
    type: "system",
    title: "Weekly progress report ready",
    message: "Your weekly progress report is ready. You've completed 78% of planned sessions — great work this week!",
    time: "Yesterday, 9:00 PM",
    isRead: true,
  },
  {
    id: "sys4",
    type: "system",
    title: "Subscription renews in 3 days",
    message: "Your MAPSKILL AI subscription will auto-renew in 3 days. Manage your billing details from the Profile page.",
    time: "2 days ago",
    isRead: true,
  },
];

// ─── Config ────────────────────────────────────────────────────────────────────

const TAB_CONFIG: { value: string; label: string; type?: NotificationType; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: Bell },
  { value: "study", label: "Study Reminders", type: "study", icon: BookOpen },
  { value: "exam", label: "Exam Reminders", type: "exam", icon: CalendarClock },
  { value: "task", label: "Pending Tasks", type: "task", icon: ClipboardList },
  { value: "system", label: "System", type: "system", icon: Settings2 },
];

const NOTIFICATION_ICON: Record<NotificationType, React.ElementType> = {
  study: BookOpen,
  exam: CalendarClock,
  task: ClipboardList,
  system: Sparkles,
};

const NOTIFICATION_COLOR: Record<NotificationType, string> = {
  study: "text-sky-400",
  exam: "text-amber-400",
  task: "text-emerald-400",
  system: "hsl(var(--primary))",
};

const NOTIFICATION_BG: Record<NotificationType, string> = {
  study: "bg-sky-400/10",
  exam: "bg-amber-400/10",
  task: "bg-emerald-400/10",
  system: "bg-primary/10",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUnreadCount(notifications: Notification[], type?: NotificationType) {
  return notifications.filter((n) => !n.isRead && (type ? n.type === type : true)).length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDismiss }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICON[notification.type];
  const iconColor = NOTIFICATION_COLOR[notification.type];
  const iconBg = NOTIFICATION_BG[notification.type];

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
        notification.isRead
          ? "border-border/40 bg-card/40 opacity-70 hover:opacity-90"
          : "border-border bg-card shadow-sm hover:border-primary/30 hover:shadow-md",
      )}
      style={notification.isRead ? {} : { background: "hsl(var(--card))" }}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className={cn("mt-0.5 flex-shrink-0 rounded-xl p-2.5", iconBg)}>
        <Icon
          className="h-4 w-4"
          style={typeof iconColor === "string" && iconColor.startsWith("hsl")
            ? { color: iconColor }
            : undefined}
          {...(typeof iconColor === "string" && !iconColor.startsWith("hsl")
            ? { className: `h-4 w-4 ${iconColor}` }
            : {})}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-semibold leading-tight",
              notification.isRead ? "text-muted-foreground" : "text-[hsl(var(--foreground))]",
            )}
          >
            {notification.title}
          </p>
          <span className="flex-shrink-0 text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
            <Clock className="h-3 w-3" />
            {notification.time}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDismiss(notification.id)}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Dismiss
          </Button>
        </div>
      </div>

      {/* Quick dismiss — top right */}
      <button
        aria-label="Dismiss notification"
        onClick={() => onDismiss(notification.id)}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface EmptyStateProps {
  label: string;
}

function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="rounded-2xl bg-primary/10 p-5">
        <CheckCheck className="h-8 w-8 text-primary" />
      </div>
      <div>
        <p className="text-base font-semibold text-[hsl(var(--foreground))]">You're all caught up!</p>
        <p className="text-sm text-muted-foreground mt-1">No {label.toLowerCase()} right now.</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (activeTab === "all") return { ...n, isRead: true };
        const tabType = TAB_CONFIG.find((t) => t.value === activeTab)?.type;
        return tabType && n.type === tabType ? { ...n, isRead: true } : n;
      }),
    );
  };

  const getFiltered = (type?: NotificationType) =>
    type ? notifications.filter((n) => n.type === type) : notifications;

  const totalUnread = getUnreadCount(notifications);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">Alerts & Reminders</p>
          <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))] mt-2 flex items-center gap-3">
            Notifications
            {totalUnread > 0 && (
              <Badge className="text-sm px-2.5 py-0.5 rounded-full font-bold">
                {totalUnread} unread
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Stay on top of exam reminders, planner updates, pending tasks and personalized study alerts from your AI
            assistant.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={totalUnread === 0}
          className="flex items-center gap-2 border-border/60 hover:border-primary/50 hover:text-primary"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Separator className="opacity-30" />

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full h-auto gap-1 flex-wrap bg-card/60 border border-border/40 rounded-xl p-1.5">
          {TAB_CONFIG.map((tab) => {
            const unread = getUnreadCount(notifications, tab.type);
            const TabIcon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
                {unread > 0 && (
                  <span
                    className={cn(
                      "ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      activeTab === tab.value
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/20 text-primary",
                    )}
                  >
                    {unread}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── All ── */}
        <TabsContent value="all" className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <EmptyState label="notifications" />
          ) : (
            <>
              {/* Group: Unread */}
              {notifications.some((n) => !n.isRead) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                    <CircleAlert className="h-3 w-3 text-primary" />
                    Unread
                  </p>
                  {notifications
                    .filter((n) => !n.isRead)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markRead} onDismiss={dismiss} />
                    ))}
                </div>
              )}
              {/* Group: Read */}
              {notifications.some((n) => n.isRead) && (
                <div className="space-y-2 mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Earlier
                  </p>
                  {notifications
                    .filter((n) => n.isRead)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markRead} onDismiss={dismiss} />
                    ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Category tabs ── */}
        {(["study", "exam", "task", "system"] as NotificationType[]).map((type) => {
          const items = getFiltered(type);
          const tab = TAB_CONFIG.find((t) => t.type === type)!;
          return (
            <TabsContent key={type} value={type} className="mt-6">
              {items.length === 0 ? (
                <EmptyState label={tab.label} />
              ) : (
                <div className="space-y-3">
                  {/* Unread first */}
                  {items.some((n) => !n.isRead) && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                        <CircleAlert className="h-3 w-3 text-primary" />
                        Unread
                      </p>
                      {items
                        .filter((n) => !n.isRead)
                        .map((n) => (
                          <NotificationItem key={n.id} notification={n} onMarkRead={markRead} onDismiss={dismiss} />
                        ))}
                    </div>
                  )}
                  {/* Read */}
                  {items.some((n) => n.isRead) && (
                    <div className="space-y-2 mt-6">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Earlier
                      </p>
                      {items
                        .filter((n) => n.isRead)
                        .map((n) => (
                          <NotificationItem key={n.id} notification={n} onMarkRead={markRead} onDismiss={dismiss} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* ── Footer tip ─────────────────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/30 px-4 py-3">
          <RefreshCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Notifications are refreshed automatically by your AI planner. Hover over a notification to reveal quick actions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
