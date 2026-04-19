import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const subjects = [
  { name: "Mathematics", progress: 75, completed: 15, total: 20, color: "#6366F1" },
  { name: "Physics", progress: 50, completed: 10, total: 20, color: "#10B981" },
  { name: "Chemistry", progress: 30, completed: 6, total: 20, color: "#F59E0B" },
  { name: "English", progress: 90, completed: 18, total: 20, color: "#EF4444" },
];

const studyHoursData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 1.5 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 1 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 2.5 },
];

const recentActivity = [
  { label: "Solved calculus problems", time: "2 days ago", delta: "+3 topics" },
  { label: "Completed thermodynamics chapter", time: "4 days ago", delta: "+2 topics" },
  { label: "Practiced chemical equations", time: "1 week ago", delta: "+1 topic" },
];

const ProgressPage = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">
        Your Progress
      </h1>
      <p className="text-muted-foreground mt-2">Track your study progress across subjects.</p>
    </div>
    <div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">49</p>
                <p className="text-sm text-muted-foreground">Topics Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">31</p>
                <p className="text-sm text-muted-foreground">Topics Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">61%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Layout: subject list + insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4">
            {subjects.map((s) => (
              <Card key={s.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-foreground">{s.name}</h3>
                    <span className="text-sm text-muted-foreground">{s.completed}/{s.total} topics</span>
                  </div>
                  <ProgressBar value={s.progress} className="h-3" />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{s.progress}% complete</span>
                    <span className={s.progress >= 70 ? "text-secondary" : "text-primary"}>
                      {s.progress >= 70 ? "On Track" : "Needs Attention"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Study Hours (last 7 days)</CardTitle>
              </CardHeader>
              <CardContent className="h-40">
                <ResponsiveContainer>
                  <LineChart data={studyHoursData} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                    <XAxis dataKey="day" tickLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <ReTooltip />
                    <Line type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={subjects.map((s) => ({ name: s.name, value: s.completed, color: s.color }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={64}
                      paddingAngle={4}
                    >
                      {subjects.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weak Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subjects.filter((s) => s.progress < 60).map((s) => (
                    <li key={s.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.progress}% complete • {s.completed}/{s.total} topics</div>
                      </div>
                      <div className="text-xs text-primary">Suggested: Focus drills</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Improvement Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 text-sm space-y-2 text-muted-foreground">
                  <li>Prioritize problem-solving in low-progress subjects.</li>
                  <li>Schedule 25–50 minute focused sessions, 3×/week for weak topics.</li>
                  <li>Use active recall and spaced repetition for retained concepts.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {recentActivity.map((a) => (
                    <li key={a.label} className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground">{a.label}</div>
                        <div className="text-xs">{a.time}</div>
                      </div>
                      <div className="text-sm text-secondary">{a.delta}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
    </div>
  </div>
);

export default ProgressPage;
