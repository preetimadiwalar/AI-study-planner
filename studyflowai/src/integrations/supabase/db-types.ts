// Hand-written types that mirror the SQL schema you ran in Supabase.

export type Difficulty = "easy" | "medium" | "hard";
export type SessionStatus = "planned" | "in_progress" | "done" | "skipped";
export type NotifType = "reminder" | "warning" | "info" | "achievement";
export type AppRole = "admin" | "user";

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  timezone: string | null;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  difficulty: Difficulty;
  exam_date: string | null;
  hours_per_week: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicRow {
  id: string;
  subject_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export interface PlannerSessionRow {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string | null;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: SessionStatus;
  completed_at: string | null;
  created_at: string;
}

export interface PomodoroLogRow {
  id: string;
  user_id: string;
  subject_id: string | null;
  session_id: string | null;
  focus_minutes: number;
  break_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export interface NoteRow {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface AiTipRow {
  id: string;
  user_id: string;
  subject_id: string | null;
  tip: string;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string; name: string; email: string }; Update: Partial<ProfileRow> };
      subjects: { Row: SubjectRow; Insert: Partial<SubjectRow> & { user_id: string; name: string }; Update: Partial<SubjectRow> };
      topics: { Row: TopicRow; Insert: Partial<TopicRow> & { user_id: string; subject_id: string; title: string }; Update: Partial<TopicRow> };
      planner_sessions: {
        Row: PlannerSessionRow;
        Insert: Partial<PlannerSessionRow> & { user_id: string; subject_id: string; date: string; start_time: string };
        Update: Partial<PlannerSessionRow>;
      };
      pomodoro_logs: { Row: PomodoroLogRow; Insert: Partial<PomodoroLogRow> & { user_id: string; focus_minutes: number }; Update: Partial<PomodoroLogRow> };
      notes: { Row: NoteRow; Insert: Partial<NoteRow> & { user_id: string; title: string }; Update: Partial<NoteRow> };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow> & { user_id: string; title: string }; Update: Partial<NotificationRow> };
      ai_tips: { Row: AiTipRow; Insert: Partial<AiTipRow> & { user_id: string; tip: string }; Update: Partial<AiTipRow> };
      user_roles: { Row: UserRoleRow; Insert: Partial<UserRoleRow> & { user_id: string; role: AppRole }; Update: Partial<UserRoleRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      difficulty: Difficulty;
      session_status: SessionStatus;
      notif_type: NotifType;
      app_role: AppRole;
    };
  };
}
