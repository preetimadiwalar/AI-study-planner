import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format, startOfWeek, isSameDay } from "date-fns";
import { 
  Sparkles, 
  Trash2, 
  Bot, 
  Calendar, 
  Clock, 
  Target, 
  Zap,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  MoreHorizontal,
  CalendarDays,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  FolderOpen,
  Plus,
  Save,
  Download,
  Eye,
  ArrowUpRight,
  Layers,
  LayoutGrid,
  ZapOff,
  Flame,
  Activity,
  MessageSquare,
  Send,
  User,
  Stars,
  Settings,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";
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
  type PlannerSession,
  type Subject
} from "@/lib/store";
import { generateTimetable } from "@/lib/planner";
import { generateAITimetable, getAIInsights, chatWithAI } from "@/lib/gemini";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GlitterBackground } from "@/components/GlitterBackground";

export const Route = createFileRoute("/dashboard/planner")({
  component: PlannerPage,
});

interface SavedPlan {
  name: string;
  date: string;
  sessions: PlannerSession[];
}

function PlannerPage() {
  const user = useAuth();
  const qc = useQueryClient();
  const subjects = useStore<Subject[]>(
    ["subjects", user?.id],
    () => (user ? getSubjects(user.id) : Promise.resolve([])),
    []
  );
  const planner = useStore<PlannerSession[]>(
    ["planner", user?.id],
    () => (user ? getPlanner(user.id) : Promise.resolve([])),
    []
  );

  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ tips: string[], analysis: string, readiness: number, subjectBreakdown: { name: string, difficulty: string, priority: string }[] }>({
     tips: ["Stay focused on your study goals!", "Review your most difficult subjects early in the day.", "Make sure to schedule regular breaks."],
     analysis: "Awaiting deep-link analysis...",
     readiness: 0,
     subjectBreakdown: []
  });
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);



  const [goal, setGoal] = useState("Exam Preparation");
  const [energy, setEnergy] = useState<"morning" | "night">("morning");



  const fetchSuggestions = async () => {
    if (subjects.length > 0) {
      setIsSuggestionsLoading(true);
      try {
        const insights = await getAIInsights(subjects, planner);
        if (insights) setAiInsights(insights);
      } catch (err) {} finally { setIsSuggestionsLoading(false); }
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const resp = await chatWithAI(msg, { subjects, planner });
      setChatHistory(prev => [...prev, { role: 'ai', text: resp }]);
    } catch (e) {} finally { setChatLoading(false); }
  };

  useEffect(() => { fetchSuggestions(); }, [subjects.length, planner.length]);

  if (!user) return null;

  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const generate = async () => {
    if (subjects.length === 0) { toast.error("Add subjects first."); return; }
    setIsGenerating(true);
    try {
      let sessions = mode === "ai" 
        ? await generateAITimetable(subjects, { startDate: new Date(), days: 7, hoursPerDay: 4, goal })
        : generateTimetable(subjects, { startDate: new Date(), days: 7, hoursPerDay: 4, startHour: 9, sessionLengthMin: 45 });
      await savePlanner(user.id, sessions);
      qc.invalidateQueries({ queryKey: ["planner", user.id] });
      // NEW: Refresh AI insights after preference update
      await fetchSuggestions();
      toast.success(`Matrix Initialized.`);
    } catch (err: any) { toast.error(`Sync failed: ${err.message}`); } finally { setIsGenerating(false); }
  };



  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-10 relative pb-24 min-h-screen">
      <GlitterBackground count={15} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-600 text-white flex items-center justify-center shadow-2xl border-4 border-emerald-400/20 rotate-3">
            <Activity className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-[-0.06em] text-emerald-950 flex items-center gap-3">
              SYNAPSE PLANNER
              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black border border-emerald-200 uppercase">Pro</span>
            </h1>
            <div className="flex items-center gap-2 text-emerald-600/60 font-black text-[10px] uppercase tracking-[0.3em]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sync Active • {format(new Date(), "yyyy.MM.dd")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-[2.5rem] border border-emerald-100 backdrop-blur-3xl shadow-xl shadow-emerald-900/5">
           <div className="flex bg-emerald-100/50 p-1.5 rounded-2xl">
              <button onClick={() => setMode("manual")} className={cn("px-8 py-3.5 text-[10px] rounded-xl font-black uppercase transition-all", mode === "manual" ? "bg-white text-emerald-600 shadow-md" : "text-emerald-800/40")}>Classic</button>
              <button onClick={() => setMode("ai")} className={cn("px-8 py-3.5 text-[10px] rounded-xl font-black uppercase transition-all flex items-center gap-2", mode === "ai" ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-800/40")}><Stars className="h-3 w-3" />AI Core</button>
           </div>
           <Button onClick={async () => { await savePlanner(user.id, []); qc.invalidateQueries({ queryKey: ["planner", user.id] }); toast.success("Plan cleared"); }} variant="ghost" className="h-12 w-12 rounded-2xl hover:text-red-500 transition-all"><Trash2 className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="relative z-10">
        <div className="rounded-[2.5rem] border-2 border-emerald-100 bg-white/70 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-48 w-48 bg-emerald-100 opacity-20 blur-[80px]" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-xl font-black text-emerald-950 tracking-tight">AI Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-center gap-4">
                 <Label className="text-xs font-black text-emerald-950/60 w-16">Goal</Label>
                 <div className="flex-1 h-12 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between px-6 cursor-pointer hover:bg-emerald-50 text-xs font-black text-emerald-900 italic">
                    {goal} <ChevronDown className="h-4 w-4 text-emerald-300" />
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <Label className="text-xs font-black text-emerald-950/60 w-16">Subjects</Label>
                 <div className="flex-1 h-12 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between px-6 cursor-pointer hover:bg-emerald-50 text-xs font-black text-emerald-950">
                    {format(new Date(), "MMM d, yyyy")} <ChevronDown className="h-4 w-4 text-emerald-300" />
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <Label className="text-xs font-black text-emerald-950/60 w-16 whitespace-nowrap">Exam Dates</Label>
                 <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none pb-1">
                    {subjects.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded-full bg-emerald-50/50 border border-emerald-100 shrink-0">
                         <div className="h-4 w-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center">●</div>
                         <span className="text-[10px] font-black text-emerald-950 pr-2">{s.name}</span>
                         <div className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[8px] font-black uppercase">Hard</div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <Label className="text-xs font-black text-emerald-950/60 w-32 whitespace-nowrap">Daily Energy Level</Label>
                 <div className="flex-1 h-12 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center px-2 gap-1">
                    <button onClick={() => setEnergy("morning")} className={cn("flex-1 h-8 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black transition-all", energy === "morning" ? "bg-white text-emerald-600 shadow-sm" : "text-emerald-300")}><Sun className="h-3 w-3" /> Morning Person</button>
                    <button onClick={() => setEnergy("night")} className={cn("flex-1 h-8 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black transition-all", energy === "night" ? "bg-white text-emerald-600 shadow-sm" : "text-emerald-300")}><Moon className="h-3 w-3" /> Night Owl</button>
                    <ChevronDown className="h-3 w-3 text-emerald-200 mr-2" />
                 </div>
              </div>
            </div>
            <div className="pt-4 flex justify-center">
               <Button onClick={generate} disabled={isGenerating} className="h-14 px-10 rounded-2xl gap-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.03]">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                Update Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between mb-8 group">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white border-2 border-emerald-50 text-emerald-950 flex items-center justify-center font-black text-xs shadow-sm shadow-emerald-900/5">
                     {format(new Date(selectedDate), "MMM")}
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900/20">Weekly Matrix</h3>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), -7), "yyyy-MM-dd"))} className="h-10 w-10 rounded-xl bg-white border border-emerald-50 hover:bg-emerald-50 text-emerald-400"><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                  <Button variant="ghost" onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), 7), "yyyy-MM-dd"))} className="h-10 w-10 rounded-xl bg-white border border-emerald-50 hover:bg-emerald-50 text-emerald-400"><ChevronRight className="h-4 w-4" /></Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-5">
               {weekDays.map((date, i) => {
                 const ds = format(date, "yyyy-MM-dd");
                 const sessions = planner.filter(s => s.date === ds);
                 const today = isSameDay(date, new Date());
                 return (
                   <div key={ds} className={cn("space-y-5", today ? "scale-[1.05]" : "")}>
                      <div className={cn("rounded-[2.5rem] p-7 flex flex-col items-center gap-1.5 border-2", today ? "bg-emerald-950 border-emerald-900 text-white shadow-2xl" : "bg-white border-emerald-50 text-emerald-950/40")}>
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">{format(date, "EEE")}</span>
                         <span className="text-3xl font-black">{format(date, "d")}</span>
                      </div>
                      <div className="space-y-3">
                         {sessions.map(s => {
                           const subj = subjectById[s.subjectId];
                           return subj && (
                             <div key={s.id} onClick={() => toggleSessionDone(user.id, s.id)} className={cn("rounded-[2.25rem] p-6 cursor-pointer border-2 transition-all", s.completed ? "bg-emerald-50/30 opacity-40 grayscale" : "bg-white border-transparent shadow-lg shadow-emerald-900/5 hover:border-emerald-200")}>
                                <div className="space-y-3">
                                  <span className="text-[9px] font-black text-emerald-200 uppercase">{s.startTime}</span>
                                  <p className="text-xs font-black text-emerald-950 leading-tight">{subj.name}</p>
                                  <div className="h-1 w-full bg-emerald-50 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: s.completed ? '100%' : '15%' }} /></div>
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                 );
               })}
            </div>
        </div>

        {/* AI Sidebar */}
        <div className="lg:col-span-4 space-y-12">
           {/* AI Insights Panel (Image Type) */}
           <div className="rounded-[3.5rem] bg-white p-12 shadow-[0_45px_100px_rgba(0,0,0,0.03)] border border-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                 <div className="h-20 w-20 rounded-full border-4 border-emerald-50 flex items-center justify-center font-black text-emerald-600 text-lg relative">
                    {aiInsights.readiness}%
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow opacity-20" />
                 </div>
                 <p className="text-[8px] font-black uppercase text-center mt-2 text-emerald-400">Readiness</p>
              </div>

              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><BrainCircuit className="h-7 w-7" /></div>
                    <h3 className="text-2xl font-black text-emerald-950 tracking-tight">AI Assistant</h3>
                 </div>
                 <Button variant="ghost" onClick={fetchSuggestions} className="h-10 w-10 text-emerald-200 hover:text-emerald-400 transition-colors"><RefreshCw className={cn("h-5 w-5", isSuggestionsLoading && "animate-spin")} /></Button>
              </div>

              <div className="space-y-10">
                 <div className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100/50">
                    <h4 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.2em] mb-3">Focus Analysis</h4>
                    <p className="text-xs font-medium text-emerald-700 leading-relaxed italic">"{aiInsights.analysis}"</p>
                 </div>

                 <div className="space-y-6">
                    {aiInsights.tips.map((tip, idx) => (
                       <div key={idx} className="flex gap-6 group/tip">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover/tip:scale-110", 
                             idx === 0 ? "bg-orange-50 border-orange-100/30 text-orange-400" : 
                             idx === 1 ? "bg-emerald-50 border-emerald-100/30 text-emerald-500" : 
                             "bg-blue-50 border-blue-100/30 text-blue-400")}>
                             {idx === 0 ? <Lightbulb className="h-5 w-5" /> : idx === 1 ? <Target className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                          </div>
                          <div className="space-y-1 pt-1.5">
                             <h4 className="text-[11px] font-black text-emerald-950 uppercase tracking-tight">{idx === 0 ? "Insight" : idx === 1 ? "Priority" : "Pro Tip"}</h4>
                             <p className="text-[13px] font-medium text-emerald-600/70 leading-relaxed">{tip}</p>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* New: Subject Breakdown analysis */}
                 {aiInsights.subjectBreakdown.length > 0 && (
                   <div className="pt-8 border-t border-emerald-50 space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.2em]">Subject Intelligence</h4>
                      <div className="grid grid-cols-1 gap-3">
                         {aiInsights.subjectBreakdown.map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/20">
                               <span className="text-xs font-black text-emerald-950">{s.name}</span>
                               <div className="flex gap-2">
                                  <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", 
                                     s.difficulty === 'Hard' ? "bg-red-100 text-red-600" : s.difficulty === 'Medium' ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600")}>
                                     {s.difficulty}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-white text-[8px] font-black uppercase">{s.priority}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>




        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-6">
         {isChatOpen && (
            <div className="w-[400px] rounded-[3rem] bg-emerald-950 p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
               <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-400/10 blur-[80px] pointer-events-none" />
               
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Bot className="h-5 w-5" /></div>
                     <div>
                        <h3 className="text-sm font-black text-white tracking-tight">Synapse AI</h3>
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active Intelligence</p>
                     </div>
                  </div>
                  <Button onClick={() => setIsChatOpen(false)} variant="ghost" className="h-8 w-8 rounded-full text-emerald-700 hover:text-white hover:bg-white/5 transition-all">
                     <ChevronDown className="h-5 w-5" />
                  </Button>
               </div>

               <div className="h-[350px] overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-emerald-800 space-y-4 flex flex-col">
                  {chatHistory.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <Sparkles className="h-10 w-10 text-emerald-500 opacity-20 animate-pulse" />
                        <p className="text-[10px] font-black text-emerald-100/30 uppercase tracking-widest leading-loose max-w-[150px]">Your personal intelligence coach is ready</p>
                     </div>
                  ) : (
                     chatHistory.map((msg, i) => (
                        <div key={i} className={cn("max-w-[85%] rounded-[1.5rem] p-4 text-[13px] font-medium leading-relaxed animate-in slide-in-from-bottom-2 duration-300", 
                           msg.role === 'user' ? "bg-emerald-900 text-white self-end rounded-br-none border border-emerald-800" : "bg-emerald-500 text-white self-start rounded-tl-none")}>
                           {msg.text}
                        </div>
                     ))
                  )}
                  {chatLoading && (
                     <div className="bg-emerald-500 text-white self-start rounded-[1.5rem] rounded-tl-none p-4 text-[13px] font-medium animate-pulse">
                        Neural processing...
                     </div>
                  )}
               </div>

               <div className="relative group/input">
                  <Input 
                     value={chatInput} 
                     onChange={e => setChatInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleChat()}
                     placeholder="Ask Synapse..." 
                     className="h-14 rounded-2xl bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-700 text-xs px-6 pr-14 focus:border-emerald-500 transition-all font-medium" 
                  />
                  <button 
                     onClick={handleChat}
                     className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg active:scale-95">
                     <Send className="h-4 w-4" />
                  </button>
               </div>
            </div>
         )}
         
         <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn("h-16 w-16 rounded-[2rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-950/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group", isChatOpen ? "rotate-90 bg-emerald-950" : "")}>
            {isChatOpen ? <ChevronDown className="h-7 w-7 rotate-90" /> : <MessageSquare className="h-7 w-7 group-hover:animate-bounce" />}
            {!isChatOpen && <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full animate-ping" />}
         </button>
      </div>
    </div>
  );
}

