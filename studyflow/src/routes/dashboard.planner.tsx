import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import {
  getPlanner,
  getSubjects,
  pushNotification,
  savePlanner,
  toggleSessionDone,
} from "@/lib/store";
import { generateTimetable } from "@/lib/planner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/planner")({
  component: PlannerPage,
});

function PlannerPage() {
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
  const [view, setView] = useState<"day" | "week">("week");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // generation options
  const [days, setDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [startHour, setStartHour] = useState(16);
  const [sessionLength, setSessionLength] = useState(45);

  if (!user) return null;

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const generate = async () => {
    if (subjects.length === 0) {
      toast.error("Add at least one subject first.");
      return;
    }
    const sessions = generateTimetable(subjects, {
      startDate: new Date(),
      days,
      hoursPerDay,
      startHour,
      sessionLengthMin: sessionLength,
    });
    try {
      await savePlanner(user.id, sessions);
      await pushNotification(user.id, {
        title: "New timetable generated",
        body: `Planned ${sessions.length} sessions across ${days} days.`,
        type: "info",
      });
      qc.invalidateQueries({ queryKey: ["planner", user.id] });
      qc.invalidateQueries({ queryKey: ["notifications", user.id] });
      toast.success(`Generated ${sessions.length} sessions`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save plan.");
    }
  };

  const clearPlan = async () => {
    if (!confirm("Clear all planned sessions?")) return;
    try {
      await savePlanner(user.id, []);
      qc.invalidateQueries({ queryKey: ["planner", user.id] });
      toast.success("Plan cleared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not clear plan.");
    }
  };

  const onToggle = async (id: string) => {
    try {
      await toggleSessionDone(user.id, id);
      qc.invalidateQueries({ queryKey: ["planner", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update session.");
    }
  };

  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <>
      <PageHeader
        title="Planner"
        description="Generate a smart timetable and track each session as you go."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearPlan} disabled={planner.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
            <Button onClick={generate} className="gap-2">
              <Sparkles className="h-4 w-4" /> Generate
            </Button>
          </div>
        }
      />

      {/* Generator settings */}
      <div className="rounded-2xl border bg-card p-5 mb-6">
        <h2 className="font-semibold mb-4">Generator settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Days">
            <Input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
            />
          </Field>
          <Field label="Hours / day">
            <Input
              type="number"
              min={1}
              max={12}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Math.max(1, Number(e.target.value)))}
            />
          </Field>
          <Field label="Start hour">
            <Input
              type="number"
              min={0}
              max={23}
              value={startHour}
              onChange={(e) => setStartHour(Math.max(0, Number(e.target.value)))}
            />
          </Field>
          <Field label="Session (min)">
            <Input
              type="number"
              min={15}
              max={120}
              step={5}
              value={sessionLength}
              onChange={(e) => setSessionLength(Math.max(15, Number(e.target.value)))}
            />
          </Field>
        </div>
      </div>

      {planner.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <span className="h-12 w-12 mx-auto rounded-2xl gradient-brand text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold">No plan yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {subjects.length === 0
              ? "Add subjects first, then generate your smart timetable."
              : "Click Generate to create a timetable balanced by difficulty and exam dates."}
          </p>
          {subjects.length === 0 ? (
            <Button asChild className="mt-5">
              <Link to="/dashboard/subjects">Add subjects</Link>
            </Button>
          ) : (
            <Button onClick={generate} className="mt-5 gap-2">
              <Sparkles className="h-4 w-4" /> Generate plan
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* View toggle */}
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex rounded-lg border p-1 bg-card">
              <button
                onClick={() => setView("day")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md font-medium",
                  view === "day"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Day
              </button>
              <button
                onClick={() => setView("week")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md font-medium",
                  view === "week"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Week
              </button>
            </div>
            {view === "day" && (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            )}
          </div>

          {view === "day" ? (
            <DayList
              date={selectedDate}
              sessions={planner.filter((p) => p.date === selectedDate)}
              subjectById={subjectById}
              onToggle={onToggle}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {weekDays.map((d) => {
                const ds = format(d, "yyyy-MM-dd");
                const items = planner
                  .filter((p) => p.date === ds)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                const isToday = ds === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={ds}
                    className={cn(
                      "rounded-2xl border bg-card p-3 min-h-[180px]",
                      isToday && "ring-2 ring-primary/40",
                    )}
                  >
                    <div className="mb-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        {format(d, "EEE")}
                      </p>
                      <p className="text-lg font-semibold">{format(d, "d")}</p>
                    </div>
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No sessions</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {items.map((s) => {
                          const subj = subjectById[s.subjectId];
                          if (!subj) return null;
                          return (
                            <li
                              key={s.id}
                              onClick={() => onToggle(s.id)}
                              className={cn(
                                "rounded-lg p-2 cursor-pointer transition-opacity",
                                s.completed && "opacity-50",
                              )}
                              style={{
                                background: `color-mix(in oklab, ${subj.color} 18%, transparent)`,
                              }}
                            >
                              <p className="text-[11px] font-semibold text-foreground/80">
                                {s.startTime}
                              </p>
                              <p
                                className={cn(
                                  "text-xs font-medium truncate",
                                  s.completed && "line-through",
                                )}
                              >
                                {subj.name}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function DayList({
  date,
  sessions,
  subjectById,
  onToggle,
}: {
  date: string;
  sessions: Awaited<ReturnType<typeof getPlanner>>;
  subjectById: Record<string, Awaited<ReturnType<typeof getSubjects>>[number]>;
  onToggle: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        No sessions for {format(new Date(date), "MMM d, yyyy")}.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border bg-card p-3">
      <ul className="divide-y">
        {sessions
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((s) => {
            const subj = subjectById[s.subjectId];
            if (!subj) return null;
            return (
              <li key={s.id} className="flex items-center gap-3 py-3 px-2">
                <button
                  onClick={() => onToggle(s.id)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                    s.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary",
                  )}
                  aria-label={s.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {s.completed && <CheckCircle2 className="h-4 w-4" />}
                </button>
                <span className="h-8 w-1 rounded-full" style={{ background: subj.color }} />
                <div className="w-16 text-sm font-semibold">{s.startTime}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium truncate",
                      s.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {subj.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {subj.difficulty} · {s.durationMin} min
                  </p>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
