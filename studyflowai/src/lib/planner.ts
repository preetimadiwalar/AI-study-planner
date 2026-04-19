// Smart timetable generator.
// Difficulty-based prioritization: harder subjects + closer exams = more weight.

import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { PlannerSession, Subject } from "./store";

const uid = () => Math.random().toString(36).slice(2, 10);

const DIFFICULTY_WEIGHT: Record<Subject["difficulty"], number> = {
  easy: 1,
  medium: 1.6,
  hard: 2.4,
};

export interface GenerateOptions {
  startDate: Date;
  days: number; // horizon, e.g. 7 or 14
  hoursPerDay: number; // total study hours per day
  startHour: number; // 24h, e.g. 16 for 4pm
  sessionLengthMin: number; // e.g. 45
}

export const DEFAULT_GEN_OPTIONS: GenerateOptions = {
  startDate: new Date(),
  days: 7,
  hoursPerDay: 3,
  startHour: 16,
  sessionLengthMin: 45,
};

interface SubjectScore {
  subject: Subject;
  score: number;
}

function scoreSubjects(subjects: Subject[], today: Date): SubjectScore[] {
  return subjects.map((s) => {
    const w = DIFFICULTY_WEIGHT[s.difficulty];
    let urgency = 1;
    if (s.examDate) {
      const days = Math.max(1, differenceInCalendarDays(new Date(s.examDate), today));
      // closer exam => much higher urgency. Caps to avoid extreme spikes.
      urgency = Math.min(6, 30 / days);
    }
    return { subject: s, score: w * urgency };
  });
}

export function generateTimetable(
  subjects: Subject[],
  opts: GenerateOptions = DEFAULT_GEN_OPTIONS,
): PlannerSession[] {
  if (subjects.length === 0) return [];

  const scored = scoreSubjects(subjects, opts.startDate);
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);

  const sessionsPerDay = Math.max(
    1,
    Math.floor((opts.hoursPerDay * 60) / opts.sessionLengthMin),
  );

  // proportional allocation across the horizon
  const totalSessions = sessionsPerDay * opts.days;
  const allocation: { subject: Subject; sessions: number }[] = scored.map((s) => ({
    subject: s.subject,
    sessions: Math.max(1, Math.round((s.score / totalScore) * totalSessions)),
  }));

  // Build a queue of subjects to schedule, interleaved (round-robin weighted)
  const queue: Subject[] = [];
  // sort by score desc so harder/urgent subjects go first each round
  const sortedAlloc = [...allocation].sort((a, b) => b.sessions - a.sessions);
  let remaining = sortedAlloc.map((a) => ({ ...a }));
  while (remaining.some((r) => r.sessions > 0)) {
    for (const r of remaining) {
      if (r.sessions > 0) {
        queue.push(r.subject);
        r.sessions -= 1;
      }
    }
  }

  const result: PlannerSession[] = [];
  let q = 0;

  for (let d = 0; d < opts.days; d++) {
    const date = addDays(opts.startDate, d);
    const dateStr = format(date, "yyyy-MM-dd");
    for (let i = 0; i < sessionsPerDay; i++) {
      if (q >= queue.length) break;
      const subject = queue[q++];
      const minutesFromStart = i * opts.sessionLengthMin;
      const hour = opts.startHour + Math.floor(minutesFromStart / 60);
      const minute = minutesFromStart % 60;
      result.push({
        id: uid(),
        subjectId: subject.id,
        date: dateStr,
        startTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        durationMin: opts.sessionLengthMin,
        completed: false,
      });
    }
  }

  return result;
}

export function suggestionFor(
  subjects: Subject[],
  sessions: PlannerSession[],
  today: Date,
): string {
  if (subjects.length === 0)
    return "Add your subjects and exam dates so we can build your study plan.";

  const upcoming = subjects
    .filter((s) => s.examDate)
    .map((s) => ({ s, days: differenceInCalendarDays(new Date(s.examDate!), today) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  const todayStr = format(today, "yyyy-MM-dd");
  const todaysDone = sessions.filter((p) => p.date === todayStr && p.completed).length;
  const todaysTotal = sessions.filter((p) => p.date === todayStr).length;

  if (upcoming && upcoming.days <= 3) {
    return `Your ${upcoming.s.name} exam is in ${upcoming.days} day${upcoming.days === 1 ? "" : "s"} — focus on it today.`;
  }
  if (todaysTotal > 0 && todaysDone < todaysTotal) {
    return `You've completed ${todaysDone}/${todaysTotal} sessions today. Keep going!`;
  }
  if (todaysTotal > 0 && todaysDone === todaysTotal) {
    return "Great work — you've finished today's plan. Review notes for 10 minutes.";
  }
  return "Generate a timetable from the Planner page to get started.";
}
