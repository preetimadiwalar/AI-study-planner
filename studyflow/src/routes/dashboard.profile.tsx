import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { LogOut, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import {
  getPlanner,
  getSubjects,
  signOut,
  updateUser,
} from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuth();
  const navigate = useNavigate();
  const subjects = useStore<Awaited<ReturnType<typeof getSubjects>>>(
    ["subjects", user?.id],
    () => (user ? getSubjects(user.id) : Promise.resolve([])),
    [],
  );
  const planner = useStore<Awaited<ReturnType<typeof getPlanner>>>(
    ["planner", user?.id],
    () => (user ? getPlanner(user.id) : Promise.resolve([])),
    [],
  );

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  if (!user) return null;

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(password ? { password } : {}),
      });
      setPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    }
  };

  const onLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <>
      <PageHeader title="Profile" description="Manage your account and preferences." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="h-14 w-14 rounded-2xl gradient-brand text-primary-foreground text-xl font-semibold flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" /> Account summary
          </h3>
          <Row label="Member since" value={format(new Date(user.createdAt), "MMM d, yyyy")} />
          <Row label="Subjects" value={subjects.length.toString()} />
          <Row label="Planned sessions" value={planner.length.toString()} />
          <Row
            label="Completed sessions"
            value={planner.filter((p) => p.completed).length.toString()}
          />
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
