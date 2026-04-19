import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { getPlanner, getSubjects } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const user = useAuth();
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

  const total = planner.length;
  const done = planner.filter((p) => p.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // per-subject
  const perSubject = subjects.map((s) => {
    const sList = planner.filter((p) => p.subjectId === s.id);
    const sDone = sList.filter((p) => p.completed).length;
    return {
      subject: s,
      total: sList.length,
      done: sDone,
      pct: sList.length ? Math.round((sDone / sList.length) * 100) : 0,
    };
  });

  // last 7 days completion (mini bars)
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const ds = format(d, "yyyy-MM-dd");
    const dayList = planner.filter((p) => p.date === ds);
    const dayDone = dayList.filter((p) => p.completed).length;
    return {
      date: d,
      label: format(d, "EEE"),
      done: dayDone,
      total: dayList.length,
    };
  });

  const maxDay = Math.max(1, ...last7.map((d) => Math.max(d.total, d.done)));

  // streak: consecutive days from today going back where at least 1 session was completed
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const ds = format(subDays(today, i), "yyyy-MM-dd");
    const completedThatDay = planner.some((p) => p.date === ds && p.completed);
    if (completedThatDay) streak++;
    else break;
  }

  return (
    <>
      <PageHeader
        title="Progress"
        description="See completion across subjects and your last 7 days."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <BigStat label="Overall completion" value={`${pct}%`} hint={`${done}/${total} sessions`} />
        <BigStat label="Current streak" value={`${streak}d`} hint="Days with a completed session" />
        <BigStat label="Subjects tracked" value={subjects.length.toString()} hint="Across your plan" />
      </div>

      {/* Last 7 days */}
      <div className="rounded-2xl border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Last 7 days</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {last7.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-32">
                <div
                  className="w-full max-w-[28px] rounded-t-md bg-muted"
                  style={{ height: `${(d.total / maxDay) * 100}%` }}
                  title={`${d.total} planned`}
                />
                <div
                  className="w-full max-w-[28px] rounded-t-md gradient-brand"
                  style={{ height: `${(d.done / maxDay) * 100}%` }}
                  title={`${d.done} done`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-muted" /> Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm gradient-brand" /> Completed
          </span>
        </div>
      </div>

      {/* Per subject */}
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold mb-4">By subject</h2>
        {perSubject.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Add subjects to see per-subject progress.
          </p>
        ) : (
          <ul className="space-y-4">
            {perSubject.map(({ subject, total, done, pct }) => (
              <li key={subject.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ background: subject.color }}
                    />
                    <span className="font-medium truncate">{subject.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      · {subject.difficulty}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {done}/{total}
                  </span>
                </div>
                <Progress value={pct} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function BigStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}
