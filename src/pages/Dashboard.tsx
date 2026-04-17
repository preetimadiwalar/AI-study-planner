import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  LineChart, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Plus,
  Clock,
  Target,
  Trophy,
  Brain,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import Profile from "@/pages/Profile";
import SubjectsSection from "@/components/SubjectsSection";
import DashboardNavBar from "@/components/DashboardNavBar";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

const performanceData = [
  { name: 'Mon', hours: 4, efficiency: 85 },
  { name: 'Tue', hours: 6, efficiency: 92 },
  { name: 'Wed', hours: 3, efficiency: 78 },
  { name: 'Thu', hours: 7, efficiency: 95 },
  { name: 'Fri', hours: 5, efficiency: 88 },
  { name: 'Sat', hours: 8, efficiency: 90 },
  { name: 'Sun', hours: 4, efficiency: 82 },
];

const subjectProgress = [
  { name: 'Mathematics', value: 75, status: 'On Track', topics: '12/16' },
  { name: 'Physics', value: 45, status: 'Behind', topics: '8/18' },
  { name: 'Chemistry', value: 60, status: 'On Track', topics: '10/16' },
  { name: 'Digital Logic', value: 85, status: 'On Track', topics: '14/15' },
  { name: 'Microprocessors', value: 30, status: 'Behind', topics: '5/20' },
  { name: 'OS & Networking', value: 55, status: 'On Track', topics: '11/18' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      if (profile) setUserName(profile.full_name.split(' ')[0]);
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-primary font-mono tracking-widest text-sm animate-pulse">CONNECTING_CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-primary/30 font-sans">
      {/* Sleek Top Bar */}
      <nav className="h-16 border-b border-white bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.4)]">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tighter text-lg text-white">MAPSKILL AI</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-white/5 border border-white rounded-full px-4 py-1.5 gap-3 w-80 group focus-within:border-primary/50 transition-all">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-primary" />
              <input type="text" placeholder="Search data points..." className="bg-transparent border-none text-sm outline-none w-full text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-primary rounded-full border-2 border-black" />
              </Button>
              <div className="h-9 w-9 rounded-full border border-white bg-gradient-to-br from-slate-800 to-black p-0.5">
                <div className="h-full w-full rounded-full bg-slate-900 border border-white shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <DashboardNavBar />
      <div className="flex">
        {/* Sidebar - Minimalist */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-white h-[calc(100vh-64px)] sticky top-16 p-6 gap-8 bg-black/20">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Master Console</p>
              <div className="space-y-1">
                <NavButton icon={<LayoutDashboard />} label="Dashboard" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                <NavButton icon={<Calendar />} label="Timetable" active={activeTab === "timetable"} onClick={() => setActiveTab("timetable")} />
                <NavButton icon={<BookOpen />} label="Syllabus" active={activeTab === "syllabus"} onClick={() => setActiveTab("syllabus")} />
                <NavButton icon={<BookOpen />} label="Subjects" active={activeTab === "subjects"} onClick={() => setActiveTab("subjects")} />
                <NavButton icon={<LineChart />} label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">AI Protocols</p>
              <div className="space-y-1">
                <NavButton icon={<Target />} label="Smart Goals" active={activeTab === "goals"} onClick={() => setActiveTab("goals")} />
                <NavButton icon={<TrendingUp />} label="Prioritization" active={activeTab === "priority"} onClick={() => setActiveTab("priority")} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white space-y-1">
            <NavButton icon={<Settings />} label="Profile" onClick={() => setActiveTab("profile")} />
            <button 
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-primary transition-all rounded-xl hover:bg-primary/5"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Interface */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>Console</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-primary font-medium capitalize">{activeTab}</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                  Hello, {userName}
                </h1>
                <p className="text-slate-400 font-medium">System status optimal. 3 study cycles queued.</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-white bg-white/5 text-slate-300 hover:bg-white/10">
                  <Filter className="h-4 w-4 mr-2" /> View Logs
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all font-bold px-6">
                  <Plus className="h-4 w-4 mr-2" /> NEW_CYCLE
                </Button>
              </div>
            </header>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Visual Data Card */}
                <Card className="lg:col-span-2 bg-[#0a0a0a] border-white overflow-hidden shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-white pb-4">
                    <div>
                      <CardTitle className="text-lg text-white">Efficiency Index</CardTitle>
                      <CardDescription className="text-slate-500">Weekly performance variance</CardDescription>
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
                            <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,140,0,0.1)', borderRadius: '12px' }}
                          cursor={{ stroke: '#ff8c00', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="efficiency" stroke="#ff8c00" strokeWidth={3} fillOpacity={1} fill="url(#colorWave)" animationDuration={2000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Vertical Stat Stack */}
                <div className="space-y-6">
                   <Card className="bg-[#0a0a0a] border-white border-l-4 border-l-primary shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 font-bold text-[10px] tracking-widest uppercase text-white/50">Core Status</span>
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">88%</span>
                        <span className="text-slate-400 text-sm mb-1.5">Optimization</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                      <Brain className="h-20 w-20 text-primary" />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <div className="h-1 w-6 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Agent Insight</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        "Your <span className="text-white font-bold">Mathematics</span> depth is plateauing. Swap tonight's Physics cycle for Advanced Calculus to maintain momentum."
                      </p>
                    </CardContent>
                  </Card>
                </div>

                

                {/* Progress Indicators */}
                {subjectProgress.map((sub, i) => (
                  <Card key={i} className="bg-[#0a0a0a] border-white hover:border-primary/20 transition-all group">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-lg">{sub.name}</h4>
                          <p className="text-xs text-slate-500">{sub.topics} Topics Fixed</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest bg-primary/10 text-primary`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-mono">
                          <span className="text-slate-400">Sync Level</span>
                          <span className="text-white">{sub.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-1000 group-hover:bg-opacity-80" style={{ width: `${sub.value}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="animate-in fade-in duration-300">
                <SubjectsSection />
              </div>
            )}

            {/* Timetable View Placeholder */}
            {activeTab === "timetable" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 overflow-x-auto pb-4">
                <Card className="bg-[#0a0a0a] border-white min-w-[800px]">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-white p-6">
                    <div>
                      <CardTitle className="text-white">Master Schedule</CardTitle>
                      <CardDescription>April 12 — April 18, 2026</CardDescription>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="text-xs text-slate-500">PREV</Button>
                       <Button variant="outline" size="sm" className="text-xs border-white">NEXT</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-[80px_repeat(7,1fr)]">
                      {/* Empty corner */}
                      <div className="border-r border-b border-white p-4" />
                      {/* Days Header */}
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                        <div key={day} className="border-r border-b border-white p-4 text-center">
                          <span className="text-[10px] font-black text-slate-600 tracking-widest">{day}</span>
                          <div className={`mt-1 text-sm font-bold ${i === 0 ? "text-primary" : "text-white"}`}>{12 + i}</div>
                        </div>
                      ))}

                      {/* Time Slots */}
                      {[
                        { time: '09:00', label: '09 AM' },
                        { time: '11:00', label: '11 AM' },
                        { time: '13:00', label: '01 PM' },
                        { time: '15:00', label: '03 PM' },
                        { time: '17:00', label: '05 PM' },
                        { time: '19:00', label: '07 PM' },
                        { time: '21:00', label: '09 PM' }
                      ].map((slot, rowIndex) => (
                        <React.Fragment key={slot.time}>
                          <div className="border-r border-b border-white p-4 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                            {slot.label}
                          </div>
                          {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => {
                            // Dummy logic for filling blocks
                            const isBusy = (rowIndex + colIndex) % 3 === 0;
                            const isMath = (rowIndex + colIndex) % 4 === 0;
                            const isPhysics = (rowIndex + colIndex) % 5 === 0;
                            
                            return (
                              <div key={colIndex} className="border-r border-b border-white p-1 relative h-20 group">
                                {isMath && (
                                  <div className="absolute inset-1 rounded-md bg-primary/10 border-l-2 border-primary p-2 overflow-hidden hover:bg-primary/20 transition-colors cursor-pointer ring-1 ring-primary/20">
                                    <p className="text-[9px] font-black text-primary uppercase leading-tight">MATH_ANALYSIS</p>
                                    <p className="text-[8px] text-slate-400 mt-1 truncate">Calculus III Focus</p>
                                  </div>
                                )}
                                {isPhysics && !isMath && (
                                  <div className="absolute inset-1 rounded-md bg-white/5 border-l-2 border-slate-500 p-2 overflow-hidden hover:bg-white/10 transition-colors cursor-pointer">
                                    <p className="text-[9px] font-black text-slate-300 uppercase leading-tight">PHYS_TECH</p>
                                    <p className="text-[8px] text-slate-500 mt-1 truncate">Quantum Mechanics</p>
                                  </div>
                                )}
                                {!isMath && !isPhysics && isBusy && ( rowIndex > 2 ) && (
                                  <div className="absolute inset-1 rounded-md bg-white/5 border-l-2 border-white p-2 opacity-30">
                                    <p className="text-[8px] font-bold text-slate-600 uppercase">Buffer</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "syllabus" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {subjectProgress.map((sub, i) => (
                  <Card key={i} className="bg-[#0a0a0a] border-white/5 overflow-hidden group">
                    <div className="h-1 w-full bg-white/5">
                      <div className="h-full bg-primary" style={{ width: `${sub.value}%` }} />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">{sub.name}</h3>
                          <p className="text-xs text-slate-500">Curriculum Tracking Active</p>
                        </div>
                        <span className="text-2xl font-black text-primary/30">{sub.value}%</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded bg-white/5 border border-white/10">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">Unit 1: Fundamentals</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded bg-primary/5 border border-primary/20">
                          <div className="h-4 w-4 rounded-full border border-primary animate-pulse" />
                          <span className="text-sm font-medium">Unit 2: Advanced Processing</span>
                        </div>
                      </div>
                      <Button className="w-full mt-6 bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-widest h-12">
                        View Modules
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 p-6">
                  <CardHeader className="px-0">
                    <CardTitle className="text-white text-xl">Cognitive Mastery Variance</CardTitle>
                    <CardDescription className="text-slate-500">Fluctuation in retention levels over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 pt-10">
                    <div className="h-[280px] w-full flex items-end justify-between gap-3">
                      {[
                        { d: 'MON', v: 40 }, { d: 'TUE', v: 75 }, { d: 'WED', v: 50 }, 
                        { d: 'THU', v: 90 }, { d: 'FRI', v: 65 }, { d: 'SAT', v: 85 }, { d: 'SUN', v: 55 }
                      ].map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="relative w-full flex items-end justify-center">
                            <div className="w-full bg-white/5 rounded-t-lg transition-all duration-500 group-hover:bg-primary/20" style={{ height: '280px', position: 'absolute', bottom: 0, zIndex: 0 }} />
                            <div 
                              className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-lg shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all duration-1000 origin-bottom relative z-10" 
                              style={{ height: `${(item.v / 100) * 280}px` }} 
                            />
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-bold px-2 py-1 rounded z-20">
                              {item.v}%
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 tracking-widest">{item.d}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-[#0a0a0a] border-white/5 p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-white text-sm uppercase tracking-widest">Mastery Intel</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase mb-2">Primary Strength</p>
                        <h4 className="text-white font-bold">Vector Calculus</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-[10px] text-green-500 font-bold">+12% Mastery this week</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Attention Required</p>
                        <h4 className="text-white font-bold">Thermodynamics</h4>
                        <p className="text-[10px] text-slate-500 mt-1 italic">Retention dip detected in session 04</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a0a0a] border-white/5 p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-white text-sm uppercase tracking-widest">Load Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                      {[
                        { l: 'Focus', v: 72, c: 'bg-primary' },
                        { l: 'Recall', v: 18, c: 'bg-slate-500' },
                        { l: 'Admin', v: 10, c: 'bg-slate-800' }
                      ].map((load, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{load.l}</span>
                            <span>{load.v}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${load.c}`} style={{ width: `${load.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-white">SMART_GOALS</h2>
                  <Button variant="outline" size="sm" className="border-primary/50 text-primary">Add Goal</Button>
                </div>
                {[
                  { title: 'Complete Differential Equations', deadline: '3 days left', prog: 88 },
                  { title: 'Project Beta: Neural Architecture', deadline: '12 days left', prog: 24 }
                ].map((goal, i) => (
                  <Card key={i} className="bg-[#0a0a0a] border-white/5 p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                      <Target className="h-24 w-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">{goal.title}</h4>
                        <p className="text-sm text-primary font-mono">{goal.deadline.toUpperCase()}</p>
                      </div>
                      <div className="text-4xl font-black text-white/10 group-hover:text-primary/20 transition-colors uppercase">{goal.prog}%</div>
                    </div>
                    <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${goal.prog}%` }} />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "priority" && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                 <div className="flex flex-col gap-2 mb-10">
                    <div className="bg-primary/20 text-primary text-[10px] font-black tracking-[0.3em] uppercase w-fit px-3 py-1 rounded">AI_TACTOR_PROTOCOL</div>
                    <h2 className="text-3xl font-black text-white">Dynamic Matrix</h2>
                 </div>
                 {[
                   { id: 'TX-01', task: 'Review Organic Mechanisms', score: 9.8, prio: 'CRITICAL' },
                   { id: 'TX-02', task: 'Solve Vector Calculus Set', score: 8.4, prio: 'HIGH' },
                   { id: 'TX-03', task: 'Thermodynamics Formulas', score: 7.2, prio: 'MEDIUM' }
                 ].map((task, i) => (
                   <div key={i} className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-all group">
                     <span className="font-mono text-slate-700 font-bold">{task.id}</span>
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{task.task}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impact: {task.score}</span>
                        </div>
                     </div>
                     <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${task.prio === 'CRITICAL' ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]' : 'bg-white/5 text-slate-500'}`}>
                        {task.prio}
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="animate-in fade-in duration-300 min-h-[60vh] flex items-center justify-center">
                <Profile />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${
      active 
        ? "bg-white/5 text-white border border-white/10 shadow-lg shadow-black" 
        : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
    }`}
  >
    <span className={`p-1.5 rounded-lg transition-colors ${active ? "bg-primary text-white" : "bg-white/5 text-slate-600 group-hover:bg-white/10 group-hover:text-slate-300"}`}>
      {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
    </span>
    {label}
  </button>
);

export default Dashboard;
