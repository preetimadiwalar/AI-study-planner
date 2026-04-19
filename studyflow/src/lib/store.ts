// Supabase-backed data layer. Replaces the old localStorage store.
// All functions are async. Pages should call them via React Query.

import { supabase } from "@/integrations/supabase/client";
import type {
  Difficulty,
  NotifType,
  NotificationRow,
  PlannerSessionRow,
  ProfileRow,
  SubjectRow,
} from "@/integrations/supabase/db-types";

// ---- Re-exported types in shapes the existing UI expects ----

export type { Difficulty } from "@/integrations/supabase/db-types";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  syllabus: string;
  difficulty: Difficulty;
  examDate?: string;
  color: string;
  createdAt: string;
}

export interface PlannerSession {
  id: string;
  subjectId: string;
  date: string;
  startTime: string;
  durationMin: number;
  completed: boolean;
  topic?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: NotifType;
}

// ---- Mappers (DB row -> UI model) ----

function profileToUser(p: ProfileRow): User {
  return { id: p.id, name: p.name, email: p.email, createdAt: p.created_at };
}

function rowToSubject(r: SubjectRow): Subject {
  return {
    id: r.id,
    name: r.name,
    syllabus: r.notes ?? "",
    difficulty: r.difficulty,
    examDate: r.exam_date ?? undefined,
    color: r.color,
    createdAt: r.created_at,
  };
}

function rowToSession(r: PlannerSessionRow): PlannerSession {
  return {
    id: r.id,
    subjectId: r.subject_id,
    date: r.date,
    startTime: (r.start_time ?? "").slice(0, 5),
    durationMin: r.duration_minutes,
    completed: r.status === "done",
  };
}

function rowToNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
    read: r.read,
    type: r.type,
  };
}

// ---- Color palette for new subjects ----
const PALETTE = [
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// ============================================================
// AUTH
// ============================================================

export async function signUp(input: { name: string; email: string; password: string }): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: { name: input.name.trim() },
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Could not create account.");

  return {
    id: data.user.id,
    name: input.name.trim(),
    email: data.user.email ?? input.email,
    createdAt: data.user.created_at ?? new Date().toISOString(),
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Invalid email or password.");

  const profile = await getProfile(data.user.id);
  return (
    profile ?? {
      id: data.user.id,
      name: data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "User",
      email: data.user.email ?? email,
      createdAt: data.user.created_at ?? new Date().toISOString(),
    }
  );
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[getProfile]", error);
    return null;
  }
  return data ? profileToUser(data as ProfileRow) : null;
}

export async function updateUser(patch: { name?: string; email?: string; password?: string }): Promise<void> {
  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData.user?.id;
  if (!userId) throw new Error("Not signed in.");

  if (patch.email || patch.password) {
    const { error } = await supabase.auth.updateUser({
      ...(patch.email ? { email: patch.email } : {}),
      ...(patch.password ? { password: patch.password } : {}),
    });
    if (error) throw new Error(error.message);
  }

  const profilePatch: Record<string, unknown> = {};
  if (patch.name) profilePatch.name = patch.name;
  if (patch.email) profilePatch.email = patch.email;
  if (Object.keys(profilePatch).length > 0) {
    const { error } = await supabase.from("profiles").update(profilePatch).eq("id", userId);
    if (error) throw new Error(error.message);
  }
}

// ============================================================
// SUBJECTS
// ============================================================

export async function getSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[getSubjects]", error);
    return [];
  }
  return (data ?? []).map((r) => rowToSubject(r as SubjectRow));
}

export async function addSubject(
  userId: string,
  input: {
    name: string;
    syllabus?: string;
    difficulty: Difficulty;
    examDate?: string;
    color?: string;
  },
): Promise<Subject> {
  const existing = await getSubjects(userId);
  const color = input.color ?? PALETTE[existing.length % PALETTE.length];
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      user_id: userId,
      name: input.name,
      color,
      difficulty: input.difficulty,
      exam_date: input.examDate || null,
      notes: input.syllabus ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToSubject(data as SubjectRow);
}

export async function updateSubject(
  _userId: string,
  id: string,
  patch: Partial<Subject>,
): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.syllabus !== undefined) dbPatch.notes = patch.syllabus;
  if (patch.difficulty !== undefined) dbPatch.difficulty = patch.difficulty;
  if (patch.examDate !== undefined) dbPatch.exam_date = patch.examDate || null;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  const { error } = await supabase.from("subjects").update(dbPatch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeSubject(_userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  // planner_sessions cascade-delete via FK in SQL.
}

// ============================================================
// PLANNER
// ============================================================

export async function getPlanner(userId: string): Promise<PlannerSession[]> {
  const { data, error } = await supabase
    .from("planner_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[getPlanner]", error);
    return [];
  }
  return (data ?? []).map((r) => rowToSession(r as PlannerSessionRow));
}

/** Replace the entire planner for a user. */
export async function savePlanner(userId: string, sessions: PlannerSession[]): Promise<void> {
  // Wipe existing
  const { error: delErr } = await supabase
    .from("planner_sessions")
    .delete()
    .eq("user_id", userId);
  if (delErr) throw new Error(delErr.message);
  if (sessions.length === 0) return;

  const rows = sessions.map((s) => ({
    user_id: userId,
    subject_id: s.subjectId,
    date: s.date,
    start_time: `${s.startTime}:00`,
    duration_minutes: s.durationMin,
    status: (s.completed ? "done" : "planned") as "done" | "planned",
  }));
  const { error } = await supabase.from("planner_sessions").insert(rows);
  if (error) throw new Error(error.message);
}

export async function toggleSessionDone(_userId: string, id: string): Promise<void> {
  const { data, error: fetchErr } = await supabase
    .from("planner_sessions")
    .select("status")
    .eq("id", id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  const nextDone = (data as { status: string }).status !== "done";
  const { error } = await supabase
    .from("planner_sessions")
    .update({
      status: nextDone ? "done" : "planned",
      completed_at: nextDone ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[getNotifications]", error);
    return [];
  }
  return (data ?? []).map((r) => rowToNotification(r as NotificationRow));
}

export async function pushNotification(
  userId: string,
  n: { title: string; body: string; type?: NotifType },
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title: n.title,
    body: n.body,
    type: n.type ?? "info",
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[pushNotification]", error);
  }
}

export async function markNotificationRead(_userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw new Error(error.message);
}

export async function clearNotifications(userId: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}
