import React, { useEffect, useMemo, useState } from "react";
// DashboardNavBar removed - single top navbar in layout
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import { CalendarDays, Clock4, Sparkle, Edit3, Target, ArrowRight } from "lucide-react";

const difficultyOptions = ["Easy", "Medium", "Hard"] as const;
const allTimeSlots = ["08:00", "09:30", "11:00", "13:00", "14:30", "15:30", "16:00", "17:30"];
const difficultyColors = {
  Easy: "bg-emerald-500/10 text-emerald-300",
  Medium: "bg-amber-500/10 text-amber-300",
  Hard: "bg-rose-500/10 text-rose-300",
};

type Difficulty = typeof difficultyOptions[number];

type SubjectInput = {
  id: string;
  name: string;
  examDate: string;
  difficulty: Difficulty;
};

type Session = {
  id: string;
  date: string;
  time: string;
  subject: string;
  difficulty: Difficulty;
  duration: string;
  focus: string;
  completed: boolean;
};

const dateKey = "planner-state-v1";

const getMonday = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
};

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getWeekDates = (date: Date) => {
  const monday = getMonday(date);
  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

const calculateDaysUntil = (examDate: string) => {
  const now = new Date();
  const target = new Date(examDate);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
};

const difficultyWeight = (difficulty: Difficulty) => {
  if (difficulty === "Hard") return 3;
  if (difficulty === "Medium") return 2;
  return 1;
};

const sortSubjectsByPriority = (subjects: SubjectInput[]) =>
  [...subjects].sort((a, b) => {
    const scoreA = difficultyWeight(a.difficulty) * (1 + 7 / calculateDaysUntil(a.examDate));
    const scoreB = difficultyWeight(b.difficulty) * (1 + 7 / calculateDaysUntil(b.examDate));
    return scoreB - scoreA;
  });

const calculatePriorityScore = (subject: SubjectInput) =>
  difficultyWeight(subject.difficulty) * (1 + 7 / calculateDaysUntil(subject.examDate));

const pickSlot = (existingTimes: string[], difficulty: Difficulty) => {
  const ordered =
    difficulty === "Hard"
      ? ["08:00", "17:30", "16:00", "09:30", "14:30", "11:00", "13:00", "15:30"]
      : difficulty === "Medium"
      ? ["09:30", "14:30", "11:00", "08:00", "13:00", "15:30", "16:00", "17:30"]
      : ["13:00", "15:30", "11:00", "14:30", "08:00", "16:00", "17:30", "09:30"];

  const candidate = ordered.find((time) => !existingTimes.includes(time));
  if (candidate) return candidate;
  return allTimeSlots.find((time) => !existingTimes.includes(time)) ?? "08:00";
};

const getColorTag = (difficulty: Difficulty) => difficultyColors[difficulty];

const generateStudyPlan = (subjects: SubjectInput[], dailyHours: number) => {
  if (!subjects.length || dailyHours < 1) {
    return [];
  }

  const weekDates = getWeekDates(new Date());
  const totalBlocks = Math.max(1, dailyHours * 7);
  const weights = subjects.map((subject) => difficultyWeight(subject.difficulty) * (1 + 7 / calculateDaysUntil(subject.examDate)));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || subjects.length;

  const blocks = subjects.map((subject, index) => ({
    subject,
    weight: weights[index],
    blocks: Math.max(1, Math.round((weights[index] / totalWeight) * totalBlocks)),
  }));

  const assigned = blocks.reduce((sum, item) => sum + item.blocks, 0);
  if (assigned !== totalBlocks && blocks.length) {
    const adjustment = totalBlocks - assigned;
    blocks[0].blocks += adjustment;
  }

  const sessions: Session[] = [];
  const dayUsage = weekDates.map((date) => ({
    date,
    hours: 0,
    times: [] as string[],
  }));

  const sorted = sortSubjectsByPriority(subjects);

  sorted.forEach((subject) => {
    const blockItem = blocks.find((item) => item.subject.id === subject.id);
    if (!blockItem) return;

    for (let index = 0; index < blockItem.blocks; index += 1) {
      const targetDay = [...dayUsage].sort((a, b) => a.hours - b.hours)[0];
      if (!targetDay) continue;
      const time = pickSlot(targetDay.times, subject.difficulty);
      targetDay.hours += 1;
      targetDay.times.push(time);
      sessions.push({
        id: `${subject.id}-${index}-${formatDateKey(targetDay.date)}`,
        date: formatDateKey(targetDay.date),
        time,
        subject: subject.name,
        difficulty: subject.difficulty,
        duration: "60 min",
        focus: `${subject.name} study session`,
        completed: false,
      });
    }
  });

  return sessions.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
};

const plannerFeatures = [
  {
    title: "Smart timetable generation (AI)",
    description: "Generate an intelligent study rhythm that places harder topics at peak focus times.",
    icon: Sparkle,
  },
  {
    title: "Daily / weekly planner",
    description: "Organize every study session for today with a clear daily agenda.",
    icon: CalendarDays,
  },
  {
    title: "Difficulty-based prioritization",
    description: "Schedule hard subjects during your strongest hours.",
    icon: Clock4,
  },
  {
    title: "Edit study schedule",
    description: "Modify generated sessions and keep the plan updated.",
    icon: Edit3,
  },
];

const PlannerForm = ({
  subjects,
  setSubjects,
  dailyHours,
  setDailyHours,
  onGenerate,
  loading,
}: {
  subjects: SubjectInput[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectInput[]>>;
  dailyHours: number;
  setDailyHours: React.Dispatch<React.SetStateAction<number>>;
  onGenerate: () => void;
  loading: boolean;
}) => {
  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");

  const addSubject = () => {
    if (!subjectName.trim() || !examDate) return;
    setSubjects((current) => [
      ...current,
      { id: `${subjectName}-${Date.now()}`, name: subjectName.trim(), examDate, difficulty },
    ]);
    setSubjectName("");
    setExamDate("");
    setDifficulty("Medium");
  };

  const removeSubject = (id: string) => setSubjects((current) => current.filter((item) => item.id !== id));

  return (
    <Card className="border-ui shadow-xl p-6 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-fg">Smart timetable generation</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add subjects with difficulty + exam date, then generate an AI-friendly timetable you can edit.
        </CardDescription>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-[1.2fr,_0.8fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Subject</label>
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Subject name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Exam date</label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Difficulty</label>
              <select className="mt-1 block w-full rounded-md border border-ui bg-popover px-3 py-2 text-sm text-fg outline-none" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <Button type="button" onClick={addSubject} className="bg-primary">Add subject</Button>
            <div className="min-w-[160px]">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Daily hours</label>
              <Input
                type="number"
                min={1}
                value={dailyHours}
                onChange={(e) => setDailyHours(Math.max(1, Number(e.target.value) || 1))}
                placeholder="Hours per day"
              />
            </div>
          </div>

          {subjects.length > 0 ? (
            <div className="space-y-3 rounded-3xl border border-ui bg-card p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current subjects</p>
              {subjects.map((subject) => (
                <div key={subject.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-fg font-semibold">{subject.name}</p>
                    <p className="text-slate-400 text-sm">{subject.examDate} • {subject.difficulty}</p>
                  </div>
                  <Button variant="outline" type="button" onClick={() => removeSubject(subject.id)} className="border-ui text-slate-200">Remove</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Add subjects and exam dates to unlock a smart schedule.</p>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-ui bg-popover p-5">
          <div className="flex items-center gap-3">
            <Sparkle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-fg font-semibold">AI plan details</p>
              <p className="text-slate-400 text-sm">The algorithm prioritizes difficult subjects and upcoming exams.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subjects added</span>
              <span>{subjects.length}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Daily hours</span>
              <span>{dailyHours}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Difficulty weighting</span>
              <span>Active</span>
            </div>
          </div>
          <Button type="button" onClick={onGenerate} className="w-full bg-primary" disabled={loading || subjects.length === 0}>
            {loading ? "Generating plan..." : "Generate Smart Plan"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const PrioritizationView = ({
  subjects,
  onJumpToGeneration,
}: {
  subjects: SubjectInput[];
  onJumpToGeneration: () => void;
}) => {
  const sorted = useMemo(() => sortSubjectsByPriority(subjects), [subjects]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,_0.8fr]">
      <Card className="border-ui shadow-xl bg-card">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-fg">Difficulty-based prioritization</CardTitle>
          <CardDescription className="text-muted-foreground">
            We prioritize subjects by difficulty and how close the exam date is. This influences the AI timetable blocks.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {sorted.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ui bg-popover p-6 text-muted-foreground">
              Add subjects first to see prioritization.
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((subject, index) => {
                const score = calculatePriorityScore(subject);
                const days = calculateDaysUntil(subject.examDate);
                return (
                  <div
                    key={subject.id}
                    className="rounded-2xl border border-ui bg-popover p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                          Priority {index + 1}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getColorTag(subject.difficulty)}`}>
                          {subject.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-fg mt-2">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Exam in <span className="text-fg font-semibold">{days}</span> day{days === 1 ? "" : "s"} • Score{" "}
                        <span className="text-fg font-semibold">{score.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-2 w-40 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(100, Math.round((score / Math.max(1, calculatePriorityScore(sorted[0]))) * 100))}%`,
                          }}
                        />
                      </div>
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-ui shadow-xl bg-card">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-fg">How it affects the plan</CardTitle>
          <CardDescription className="text-muted-foreground">
            Higher-priority subjects receive more sessions across the week.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
          <div className="space-y-3">
            <div className="rounded-2xl border border-ui bg-popover p-4">
              <p className="text-fg font-semibold">Inputs</p>
              <p className="mt-1">Difficulty weight (Easy/Medium/Hard) + exam proximity.</p>
            </div>
            <div className="rounded-2xl border border-ui bg-popover p-4">
              <p className="text-fg font-semibold">Outputs</p>
              <p className="mt-1">More blocks allocated to high-priority subjects.</p>
            </div>
          </div>
          <Button type="button" onClick={onJumpToGeneration} className="w-full bg-primary">
            Go to Smart generation <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const DailyView = ({
  sessions,
  subjects,
  today,
  editing,
  toggleComplete,
  onUpdateSession,
  onAddSession,
  progress,
}: {
  sessions: Session[];
  subjects: SubjectInput[];
  today: string;
  editing: boolean;
  toggleComplete: (id: string) => void;
  onUpdateSession: (id: string, field: keyof Pick<Session, "time" | "duration" | "focus">, value: string) => void;
  onAddSession: (session: Omit<Session, "id" | "completed">) => void;
  progress: number;
}) => {
  const todaySessions = sessions.filter((session) => session.date === today);
  const [newSubject, setNewSubject] = useState(subjects[0]?.name ?? "");
  const [newTime, setNewTime] = useState("08:00");
  const [newDuration, setNewDuration] = useState("60 min");
  const [newFocus, setNewFocus] = useState("");

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some((item) => item.name === newSubject)) {
      setNewSubject(subjects[0].name);
    }
  }, [subjects, newSubject]);

  const addSession = () => {
    if (!newSubject || !newFocus.trim()) return;
    const subject = subjects.find((item) => item.name === newSubject);
    onAddSession({
      date: today,
      time: newTime,
      subject: newSubject,
      difficulty: subject?.difficulty ?? "Medium",
      duration: newDuration,
      focus: newFocus,
    });
    setNewFocus("");
  };

  return (
    <Card className="bg-[#0a0a0a] border-white/10 shadow-xl">
      <CardHeader className="border-b border-white/5 p-6">
        <div>
          <CardTitle className="text-white">Daily Planner</CardTitle>
          <CardDescription className="text-slate-400">Manage today’s study sessions and track completion.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Progress</p>
              <p className="text-white font-semibold text-lg">{progress}% completed</p>
            </div>
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300 text-sm">{today}</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full bg-white/5" />
        </div>

        {todaySessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
            No sessions scheduled for today. Add a study session below to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {todaySessions.map((session) => (
              <div key={session.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{session.time}</p>
                    <h3 className="text-lg font-bold text-white mt-2">{session.subject}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getColorTag(session.difficulty)}`}>{session.difficulty}</span>
                    <Button variant={session.completed ? "secondary" : "outline"} type="button" onClick={() => toggleComplete(session.id)}>
                      {session.completed ? "Completed" : "Mark done"}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Focus</p>
                    {editing ? (
                      <Input
                        value={session.focus}
                        onChange={(event) => onUpdateSession(session.id, "focus", event.target.value)}
                        className="border border-white/20 bg-slate-950/50 text-white"
                      />
                    ) : (
                      <p className="text-slate-300">{session.focus}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Time</p>
                    {editing ? (
                      <Input
                        type="time"
                        value={session.time}
                        onChange={(event) => onUpdateSession(session.id, "time", event.target.value)}
                        className="border border-white/20 bg-slate-950/50 text-white"
                      />
                    ) : (
                      <p className="text-slate-300">{session.time}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Duration</p>
                    {editing ? (
                      <Input
                        value={session.duration}
                        onChange={(event) => onUpdateSession(session.id, "duration", event.target.value)}
                        className="border border-white/20 bg-slate-950/50 text-white"
                      />
                    ) : (
                      <p className="text-slate-300">{session.duration}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-white font-semibold mb-4">Add a new study session</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Subject</label>
              <select className="mt-1 block w-full rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Time slot</label>
              <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Duration</label>
              <Input value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus</label>
              <Input value={newFocus} onChange={(e) => setNewFocus(e.target.value)} placeholder="What will you study?" />
            </div>
          </div>
          <Button type="button" onClick={addSession} className="mt-4 bg-primary">Add session</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const WeeklyView = ({
  sessions,
  weekDates,
  editing,
  onUpdateSession,
}: {
  sessions: Session[];
  weekDates: Date[];
  editing: boolean;
  onUpdateSession: (id: string, field: keyof Pick<Session, "time" | "duration" | "focus">, value: string) => void;
}) => {
  const dayKeys = useMemo(() => weekDates.map((date) => formatDateKey(date)), [weekDates]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const grouped = useMemo(() => {
    const map = new Map<string, Session[]>();
    dayKeys.forEach((key) => map.set(key, []));
    sessions.forEach((session) => {
      if (!map.has(session.date)) map.set(session.date, []);
      map.get(session.date)!.push(session);
    });
    map.forEach((items) => items.sort((a, b) => a.time.localeCompare(b.time) || a.subject.localeCompare(b.subject)));
    return map;
  }, [dayKeys, sessions]);

  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => (grouped.has(todayKey) ? todayKey : dayKeys[0] ?? todayKey));

  // keep selection valid if week changes
  useEffect(() => {
    if (!selectedDayKey || !dayKeys.includes(selectedDayKey)) {
      setSelectedDayKey(dayKeys[0] ?? todayKey);
    }
  }, [dayKeys, selectedDayKey, todayKey]);

  const selectedDate = useMemo(() => {
    const index = dayKeys.indexOf(selectedDayKey);
    return weekDates[index] ?? weekDates[0] ?? new Date();
  }, [dayKeys, selectedDayKey, weekDates]);

  const selectedSessions = grouped.get(selectedDayKey) ?? [];

  return (
    <Card className="bg-[#0a0a0a] border-white/10 shadow-xl">
      <CardHeader className="border-b border-white/5 p-6">
        <div>
          <CardTitle className="text-white">Weekly Planner</CardTitle>
          <CardDescription className="text-slate-400">
            Quick glance week view — tap a day to expand{editing ? " (editing enabled)" : ""}.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Week strip (glance view) */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[980px] grid grid-cols-7 gap-4">
            {weekDates.map((date) => {
              const key = formatDateKey(date);
              const items = grouped.get(key) ?? [];
              const count = items.length;
              const completed = items.filter((s) => s.completed).length;
              const pct = count === 0 ? 0 : Math.round((completed / count) * 100);
              const isSelected = key === selectedDayKey;
              const isToday = key === todayKey;
              const preview = items.slice(0, 3);
              const remaining = Math.max(0, items.length - preview.length);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDayKey(key)}
                  className={`text-left rounded-3xl border p-4 transition relative overflow-hidden ${
                    isSelected ? "border-primary/60" : "border-white/10"
                  } ${isSelected ? "bg-slate-950/80" : "bg-slate-950/60 hover:bg-slate-950/75"}`}
                >
                  {/* creative glow */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -inset-20 bg-[radial-gradient(circle_at_top,rgba(255,0,122,0.16),transparent_55%)]" />
                    </div>
                  )}

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                        {date.toLocaleDateString(undefined, { weekday: "short" })}
                      </p>
                      <p className="text-white font-black mt-1 leading-none">
                        {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isToday ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-300"}`}>
                        {count} sessions
                      </span>
                      <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 space-y-2">
                    {count === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-3 text-slate-400 text-xs">
                        No sessions
                      </div>
                    ) : (
                      <>
                        {preview.map((session) => (
                          <div
                            key={session.id}
                            className={`rounded-2xl border border-white/10 bg-white/5 px-3 py-2 ${
                              session.completed ? "opacity-60" : "opacity-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em]">{session.time}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getColorTag(session.difficulty)}`}>
                                {session.difficulty}
                              </span>
                            </div>
                            <p className="text-white text-sm font-semibold truncate mt-1">{session.subject}</p>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="text-xs text-slate-400 font-semibold pl-1">+{remaining} more</div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded day detail */}
        <Card className="bg-slate-950/70 border-white/10">
          <CardHeader className="p-6 border-b border-white/5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle className="text-white">
                  {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {selectedSessions.length === 0 ? "No sessions scheduled." : "Sessions for the selected day."}
                </CardDescription>
              </div>
              {selectedSessions.length > 0 && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300 text-sm">
                  {selectedSessions.length} session{selectedSessions.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {selectedSessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
                Add sessions from the Daily planner or generate a timetable.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedSessions.map((session) => (
                  <div key={session.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-[220px]">
                        <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">{session.time}</p>
                        <h4 className="text-white font-bold text-lg mt-2">{session.subject}</h4>
                        {!editing && <p className="text-slate-400 text-sm mt-1">{session.focus}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getColorTag(session.difficulty)}`}>
                          {session.difficulty}
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{session.duration}</span>
                      </div>
                    </div>

                    {editing && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <p className="text-slate-400 text-sm mb-2">Focus</p>
                          <Input
                            value={session.focus}
                            onChange={(event) => onUpdateSession(session.id, "focus", event.target.value)}
                            className="border border-white/20 bg-slate-950/50 text-white"
                          />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Time</p>
                          <Input
                            type="time"
                            value={session.time}
                            onChange={(event) => onUpdateSession(session.id, "time", event.target.value)}
                            className="border border-white/20 bg-slate-950/50 text-white"
                          />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Duration</p>
                          <Input
                            value={session.duration}
                            onChange={(event) => onUpdateSession(session.id, "duration", event.target.value)}
                            className="border border-white/20 bg-slate-950/50 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

const Planner = () => {
  const [subjects, setSubjects] = useState<SubjectInput[]>([]);
  const [dailyHours, setDailyHours] = useState(4);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSection, setActiveSection] = useState<"generation" | "prioritization" | "daily" | "weekly">("generation");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = formatDateKey(new Date());
  const weekDates = useMemo(() => getWeekDates(new Date()), []);

  useEffect(() => {
    const saved = localStorage.getItem(dateKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubjects(parsed.subjects ?? []);
        setDailyHours(parsed.dailyHours ?? 4);
        setSessions(parsed.sessions ?? []);
        setActiveSection(parsed.activeSection ?? "generation");
      } catch {
        // ignore invalid saved state
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(dateKey, JSON.stringify({ subjects, dailyHours, sessions, activeSection }));
  }, [subjects, dailyHours, sessions, activeSection]);

  const planSessions = (generated: Session[]) => {
    setSessions(generated);
    setActiveSection("daily");
    setEditing(false);
  };

  const handleGenerate = () => {
    if (!subjects.length || dailyHours < 1) return;
    setLoading(true);
    setTimeout(() => {
      planSessions(generateStudyPlan(subjects, dailyHours));
      setLoading(false);
    }, 500);
  };

  const toggleComplete = (id: string) => {
    setSessions((current) => current.map((session) => (session.id === id ? { ...session, completed: !session.completed } : session)));
  };

  const updateSession = (id: string, field: keyof Pick<Session, "time" | "duration" | "focus">, value: string) => {
    setSessions((current) => current.map((session) => (session.id === id ? { ...session, [field]: value } : session)));
  };

  const addSession = (session: Omit<Session, "id" | "completed">) => {
    setSessions((current) => [
      ...current,
      { ...session, id: `${session.subject}-${Date.now()}`, completed: false },
    ]);
  };

  const dailySessions = useMemo(() => sessions.filter((session) => session.date === today), [sessions, today]);
  const progress = dailySessions.length === 0 ? 0 : Math.round((dailySessions.filter((session) => session.completed).length / dailySessions.length) * 100);

  const activeButtonClass = (section: "generation" | "prioritization" | "daily" | "weekly") =>
    section === activeSection ? "bg-primary text-white" : "border-white/10 bg-slate-950/60 text-slate-200";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">Interactive study planning</h1>
          <p className="text-muted-foreground mt-2">Generate a smart timetable, prioritize by difficulty, and track your daily sessions.</p>
        </div>

        <section className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className={activeButtonClass("generation")} onClick={() => setActiveSection("generation")}>
            Smart timetable generation
          </Button>
          <Button variant="outline" className={activeButtonClass("prioritization")} onClick={() => setActiveSection("prioritization")}>
            Difficulty-based prioritization
          </Button>
          <Button variant="outline" className={activeButtonClass("daily")} onClick={() => setActiveSection("daily")}>
            Daily planner
          </Button>
          <Button variant="outline" className={activeButtonClass("weekly")} onClick={() => setActiveSection("weekly")}>
            Weekly planner
          </Button>
          <Button
            variant={editing ? "secondary" : "outline"}
            className="border-white/10"
            onClick={() => setEditing((current) => !current)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {editing ? "Editing enabled" : "Edit study schedule"}
          </Button>
        </section>

        <div className="space-y-6">
            {activeSection === "generation" && (
              <PlannerForm
                subjects={subjects}
                setSubjects={setSubjects}
                dailyHours={dailyHours}
                setDailyHours={setDailyHours}
                onGenerate={handleGenerate}
                loading={loading}
              />
            )}

            {activeSection === "prioritization" && (
              <PrioritizationView
                subjects={subjects}
                onJumpToGeneration={() => setActiveSection("generation")}
              />
            )}

            {activeSection === "daily" && (
              <DailyView
                sessions={sessions}
                subjects={subjects}
                today={today}
                editing={editing}
                toggleComplete={toggleComplete}
                onUpdateSession={updateSession}
                onAddSession={addSession}
                progress={progress}
              />
            )}

            {activeSection === "weekly" && (
              <WeeklyView
                sessions={sessions}
                weekDates={weekDates}
                editing={editing}
                onUpdateSession={updateSession}
              />
            )}
        </div>
    </div>
  );
};

export default Planner;
