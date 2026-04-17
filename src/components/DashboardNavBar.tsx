import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, CalendarCheck, BarChart3, Bell, User } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Subjects", to: "/subjects", icon: BookOpen },
  { label: "Planner", to: "/planner", icon: CalendarCheck },
  { label: "Progress", to: "/progress", icon: BarChart3 },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: User },
];

const DashboardNavBar = () => (
  <div className="sticky top-16 z-40 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">
    <div className="container flex flex-wrap items-center gap-3 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
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
);

export default DashboardNavBar;
