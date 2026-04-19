import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Logo({ to = "/" as string }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-primary-foreground shadow-[var(--shadow-elevated)]">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span className="font-semibold tracking-tight text-lg">
        Study<span className="text-gradient-brand">Flow</span>
      </span>
    </Link>
  );
}
