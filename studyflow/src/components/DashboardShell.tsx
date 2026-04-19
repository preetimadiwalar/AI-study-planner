import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  CalendarRange,
  TrendingUp,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { signOut, getNotifications } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
  { to: "/dashboard/planner", label: "Planner", icon: CalendarRange },
  { to: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/profile", label: "Profile", icon: UserIcon },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const user = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const notifications = useStore<Awaited<ReturnType<typeof getNotifications>>>(
    ["notifications", user?.id],
    () => (user ? getNotifications(user.id) : Promise.resolve([])),
    [],
  );
  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-5 py-5 border-b">
          <Logo to="/dashboard" />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.to === "/dashboard/notifications" && unread > 0 && (
                  <span className="text-[10px] font-semibold rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 min-w-[18px] text-center">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 h-full bg-sidebar text-sidebar-foreground border-r flex flex-col">
            <div className="px-5 py-5 border-b flex items-center justify-between">
              <Logo to="/dashboard" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  item.to === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t">
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card/60 backdrop-blur flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-30">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="lg:hidden">
            <Logo to="/dashboard" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/dashboard/notifications"
              className="relative p-2 rounded-md hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <span className="h-7 w-7 rounded-full gradient-brand text-primary-foreground text-xs font-semibold flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
              <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
