import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays, format } from "date-fns";
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { getPlanner, getSubjects, toggleSessionDone } from "@/lib/store";
import { suggestionFor } from "@/lib/planner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const user = useAuth();
  const qc = useQueryClient();
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

  if (!user) return null;

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todays = planner.filter((p) => p.date === todayStr);
  const todaysDone = todays.filter((p) => p.completed).length;
  const totalDone = planner.filter((p) => p.completed).length;
  const totalSessions = planner.length;
  const completionRate = totalSessions ? Math.round((totalDone / totalSessions) * 100) : 0;

  const upcomingExams = subjects
    .filter((s) => s.examDate)
    .map((s) => ({ s, days: differenceInCalendarDays(new Date(s.examDate!), today) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]} 👋`}
        description="Here's a snapshot of your study plan today."
      />

      {/* Suggestion */}
      <div className="rounded-2xl border bg-card p-5 flex items-start gap-4 mb-6">
        <span className="h-10 w-10 rounded-xl gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Today's suggestion
          </p>
          <p className="font-medium mt-1">{suggestionFor(subjects, planner, today)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BookOpen}
          label="Subjects"
          value={subjects.length.toString()}
          hint={subjects.length === 0 ? "Add your first subject" : "Tracked"}
        />
        <StatCard
          icon={CalendarRange}
          label="Sessions today"
          value={`${todaysDone}/${todays.length}`}
          hint={todays.length === 0 ? "No plan yet" : "Completed today"}
        />
        <StatCard
          icon={CheckCircle2}
          label="All-time done"
          value={totalDone.toString()}
          hint="Sessions completed"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion"
          value={`${completionRate}%`}
          hint="Across your plan"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's plan */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Today's plan</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/dashboard/planner">
                Open planner <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {todays.length === 0 ? (
            <EmptyState
              title="No sessions planned for today"
              description="Generate a smart timetable from the Planner page."
              cta={
                <Button asChild size="sm">
                  <Link to="/dashboard/planner">Go to Planner</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {todays
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((s) => {
                  const subj = subjectById[s.subjectId];
                  if (!subj) return null;
                  return (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors"
                    >
                      <button
                        onClick={async () => {
                          await toggleSessionDone(user.id, s.id);
                          qc.invalidateQueries({ queryKey: ["planner", user.id] });
                        }}
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          s.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        }`}
                        aria-label={s.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {s.completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <span
                        className="h-8 w-1 rounded-full"
                        style={{ background: subj.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${s.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {subj.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.startTime} · {s.durationMin} min
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Upcoming exams</h2>
          {upcomingExams.length === 0 ? (
            <EmptyState
              title="No exams scheduled"
              description="Add exam dates to your subjects."
              cta={
                <Button asChild size="sm" variant="outline">
                  <Link to="/dashboard/subjects">Add subjects</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {upcomingExams.map(({ s, days }) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.examDate!), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      days <= 3
                        ? "bg-destructive/10 text-destructive"
                        : days <= 7
                          ? "bg-warning/15 text-warning"
                          : "bg-primary-soft text-primary"
                    }`}
                  >
                    {days === 0 ? "Today" : `${days}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="text-center py-8">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
