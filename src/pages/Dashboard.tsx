import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Filter,
  Plus,
  ChevronRight,
  Target,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const performanceData = [
  { name: "Tue", efficiency: 85 },
  { name: "Wed", efficiency: 78 },
  { name: "Thu", efficiency: 92 },
  { name: "Fri", efficiency: 88 },
  { name: "Sat", efficiency: 95 },
  { name: "Sun", efficiency: 82 },
];

const subjectProgress = [
  { name: "Mathematics", value: 75, status: "On Track", topics: "12/16" },
  { name: "Physics", value: 45, status: "Behind", topics: "8/18" },
  { name: "Chemistry", value: 60, status: "On Track", topics: "10/16" },
  { name: "Digital Logic", value: 85, status: "On Track", topics: "14/15" },
  { name: "Microprocessors", value: 30, status: "Behind", topics: "5/20" },
  { name: "OS & Networking", value: 55, status: "On Track", topics: "11/18" },
];

const Dashboard = () => {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      if (profile?.full_name) setUserName(profile.full_name.split(" ")[0]);
    });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Context Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2" aria-label="Breadcrumb">
            <span>Console</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-medium">Overview</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))] leading-none">
            Hello, {userName}
          </h1>
          <p className="text-muted-foreground font-medium">
            System status optimal. 3 study cycles queued.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-ui bg-popover text-muted-foreground hover:bg-popover"
          >
            <Filter className="h-4 w-4 mr-2" /> View Logs
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-[hsl(var(--primary-foreground))] shadow-lg shadow-primary/20 font-bold px-6">
            <Plus className="h-4 w-4 mr-2" /> NEW_CYCLE
          </Button>
        </div>
      </header>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Efficiency Index Chart */}
        <Card
          className="lg:col-span-2 overflow-hidden shadow-2xl"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <CardHeader className="flex flex-row items-center justify-between border-b border-ui pb-4">
            <div>
              <CardTitle className="text-lg text-[hsl(var(--foreground))]">Efficiency Index</CardTitle>
              <CardDescription className="text-muted-foreground">Weekly performance variance</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold">
              <TrendingUp className="h-4 w-4" /> +14.2%
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid rgba(255,140,0,0.1)",
                    borderRadius: "12px",
                  }}
                  cursor={{ stroke: "#ff8c00", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#ff8c00"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWave)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right stat stack */}
        <div className="space-y-6">
          <Card
            style={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">
                  Core Status
                </span>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-[hsl(var(--foreground))]">88%</span>
                <span className="text-muted-foreground text-sm mb-1.5">Optimization</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden group"
            style={{
              background: "hsl(var(--accent))",
              borderColor: "hsl(var(--border))",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Brain className="h-20 w-20 text-primary" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <div className="h-1 w-6 bg-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Agent Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                "Your{" "}
                <span className="text-[hsl(var(--foreground))] font-bold">Mathematics</span> depth
                is plateauing. Swap tonight's Physics cycle for Advanced Calculus to maintain
                momentum."
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress Cards */}
        {subjectProgress.map((sub, i) => (
          <Card
            key={i}
            className="hover:border-primary/20 transition-all group"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-[hsl(var(--foreground))] text-lg">{sub.name}</h4>
                  <p className="text-xs text-slate-500">{sub.topics} Topics Fixed</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${
                    sub.status === "Behind"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-muted-foreground">Sync Level</span>
                  <span className="text-[hsl(var(--foreground))]">{sub.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-popover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 group-hover:opacity-80"
                    style={{ width: `${sub.value}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
