import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  LineChart,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Sun,
  Moon,
  Brain,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import useTheme from "@/hooks/use-theme";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", to: "/subjects", icon: BookOpen },
  { label: "Planner", to: "/planner", icon: Calendar },
  { label: "Progress", to: "/progress", icon: LineChart },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: User },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(var(--background))" }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-primary font-mono tracking-widest text-sm animate-pulse">
            CONNECTING_CORE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-primary/30 font-sans">
      {/* Top Navbar */}
      <nav className="h-16 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full h-full flex items-center px-[15px]">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.4)]">
              <Brain className="h-5 w-5 text-[hsl(var(--foreground))]" />
            </div>
            <span className="font-bold tracking-tighter text-lg text-[hsl(var(--foreground))] whitespace-nowrap">
              MAPSKILL AI
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-popover border border-ui rounded-full px-4 py-1.5 gap-3 w-80 group focus-within:border-primary/50 transition-all">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search data points..."
                className="bg-transparent border-none text-sm outline-none w-full text-muted-foreground"
                aria-label="Search"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="text-muted-foreground hover:text-fg"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-fg relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-primary rounded-full border-2 border-ui" />
              </Button>
              <div className="h-9 w-9 rounded-full border border-ui bg-gradient-to-br from-slate-800 to-black p-0.5">
                <div className="h-full w-full rounded-full bg-sidebar border border-ui shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16 p-4 gap-4 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-56"
          }`}
          style={{ background: "hsl(var(--sidebar-background))" }}
        >
          <div className="flex items-center justify-end">
            <button
              onClick={() => setSidebarCollapsed((s) => !s)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-muted-foreground hover:text-fg p-2 rounded-md transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-300 ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>

          {sidebarCollapsed ? (
            <div className="flex flex-col items-center mt-4 gap-6">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => navigate("/profile")}
                  title="Profile"
                  className="text-muted-foreground hover:text-fg transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  title="Settings"
                  className="text-muted-foreground hover:text-fg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-muted-foreground hover:text-fg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mt-2 space-y-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-popover transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-popover transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-popover transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
