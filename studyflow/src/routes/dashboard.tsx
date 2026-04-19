import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const user = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === undefined || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
