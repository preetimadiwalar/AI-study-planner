import React, { useEffect, useMemo, useState } from "react";
import DashboardNavBar from "@/components/DashboardNavBar";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock4, Sparkle, Edit3, ListChecks } from "lucide-react";

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
    title: "Daily planner",
    description: "Organize every study session for today with a clear daily agenda.",
    icon: CalendarDays,
  },
  {
    title: "Weekly planner",
    description: "Preview your weekly study load and keep work balanced across days.",
    icon: ListChecks,
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
    <Card className="bg-[#0a0a0a] border-white/10 shadow-xl p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-white">Smart Timetable Generation</CardTitle>
        <CardDescription className="text-slate-400">Add subjects, exam dates, and the hours you can study each day.</CardDescription>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-[1.2fr,_0.8fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Subject</label>
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Subject name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Exam date</label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Difficulty</label>
              <select className="mt-1 block w-full rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
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
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current subjects</p>
              {subjects.map((subject) => (
                <div key={subject.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-white font-semibold">{subject.name}</p>
                    <p className="text-slate-400 text-sm">{subject.examDate} • {subject.difficulty}</p>
                  </div>
                  <Button variant="outline" type="button" onClick={() => removeSubject(subject.id)} className="border-white/10 text-slate-200">Remove</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Add subjects and exam dates to unlock a smart schedule.</p>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-5">
          <div className="flex items-center gap-3">
            <Sparkle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-white font-semibold">AI plan details</p>
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
                        className="border border-white"
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
                        className="border border-white"
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
                        className="border border-white"
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
}: {
  sessions: Session[];
  weekDates: Date[];
}) => {
  const grouped = weekDates.map((date) => {
    const dateKey = formatDateKey(date);
    const daySessions = sessions.filter((session) => session.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));
    const totalTime = daySessions.length * 60;
    return { date, daySessions, totalTime };
  });

  return (
    <Card className="bg-[#0a0a0a] border-white/10 shadow-xl">
      <CardHeader className="border-b border-white/5 p-6">
        <div>
          <CardTitle className="text-white">Weekly Planner</CardTitle>
          <CardDescription className="text-slate-400">See the full week and time allocated to each subject.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map((day) => (
            <div key={day.date.toString()} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{day.date.toLocaleDateString(undefined, { weekday: "long" })}</p>
                  <p className="text-white font-semibold">{day.daySessions.length} sessions</p>
                </div>
                <span className="text-slate-300 text-sm">{day.totalTime} min</span>
              </div>
              <div className="mt-4 space-y-3">
                {day.daySessions.length === 0 ? (
                  <p className="text-slate-400 text-sm">No study sessions planned.</p>
                ) : (
                  day.daySessions.map((session) => (
                    <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{session.time}</p>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getColorTag(session.difficulty)}`}>{session.difficulty}</span>
                      </div>
                      <h4 className="mt-2 text-white font-semibold">{session.subject}</h4>
                      <p className="mt-1 text-slate-400 text-sm">{session.focus}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Planner = () => {
  const [subjects, setSubjects] = useState<SubjectInput[]>([]);
  const [dailyHours, setDailyHours] = useState(4);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSection, setActiveSection] = useState<"ai" | "daily" | "weekly">("ai");
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
        setActiveSection(parsed.activeSection ?? "ai");
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

  const activeButtonClass = (section: "ai" | "daily" | "weekly") =>
    section === activeSection ? "bg-primary text-white" : "border-white/10 bg-slate-950/60 text-slate-200";

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <DashboardNavBar />
      <main className="container py-10 space-y-8">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">AI Study Planner</p>
          <div>
            <h1 className="text-4xl font-black text-white">Interactive study planning</h1>
            <p className="max-w-2xl text-slate-400 mt-3">
              Build an AI-generated study timetable, manage today’s workload, and review the week with smart prioritization.
            </p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <Button variant="outline" className={activeButtonClass("ai")} onClick={() => setActiveSection("ai")}>Smart Timetable Generation</Button>
          <Button variant="outline" className={activeButtonClass("daily")} onClick={() => setActiveSection("daily")}>Daily Planner</Button>
          <Button variant="outline" className={activeButtonClass("weekly")} onClick={() => setActiveSection("weekly")}>Weekly Planner</Button>
          <Button variant={editing ? "secondary" : "outline"} className="border-white/10" onClick={() => setEditing((current) => !current)}>{editing ? "Editing enabled" : "Enable schedule editing"}</Button>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,_0.6fr]">
          <div className="space-y-6">
            {activeSection === "ai" && (
              <PlannerForm
                subjects={subjects}
                setSubjects={setSubjects}
                dailyHours={dailyHours}
                setDailyHours={setDailyHours}
                onGenerate={handleGenerate}
                loading={loading}
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

            {activeSection === "weekly" && <WeeklyView sessions={sessions} weekDates={weekDates} />}
          </div>

          <aside className="space-y-6">
            <Card className="bg-[#0a0a0a] border-white/10 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-[0.3em] font-bold">Planner Insights</p>
                  <h2 className="text-white font-black">What this planner does</h2>
                </div>
              </div>
              <div className="space-y-3 text-slate-400 text-sm">
                <p>• Generates a smart weekly timetable using exam proximity and difficulty.</p>
                <p>• Allocates more time to difficult subjects and schedules them during peak hours.</p>
                <p>• Displays a dynamic daily view with completion tracking.</p>
                <p>• Shows a full weekly view with time allocation per day.</p>
                <p>• Saves schedule updates in localStorage for persistence.</p>
              </div>
            </Card>

            <Card className="bg-[#0a0a0a] border-white/10 shadow-xl p-6">
              <CardTitle className="text-white text-lg mb-3">Plan summary</CardTitle>
              <div className="space-y-4 text-slate-300 text-sm">
                <div className="flex justify-between gap-2">
                  <span>Subjects</span>
                  <span>{subjects.length}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Daily hours</span>
                  <span>{dailyHours}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Generated sessions</span>
                  <span>{sessions.length}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Current view</span>
                  <span>{activeSection === "ai" ? "AI Plan" : activeSection === "daily" ? "Daily" : "Weekly"}</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Planner;
