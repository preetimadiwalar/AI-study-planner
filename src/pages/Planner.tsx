import DashboardNavBar from "@/components/DashboardNavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock4, Sparkle } from "lucide-react";

const plannerBlocks = [
  { time: "08:00", title: "Morning revision", detail: "Math formulas + physics definitions" },
  { time: "10:30", title: "Active problem set", detail: "Digital Logic practice" },
  { time: "13:00", title: "Break & review", detail: "Read notes and update flashcards" },
  { time: "15:00", title: "Focused session", detail: "Chemistry reaction pathways" },
  { time: "18:00", title: "Progress check", detail: "Evaluate last session and adjust plan" },
];

const Planner = () => (
  <div className="min-h-screen bg-[#050505] text-slate-200">
    <DashboardNavBar />
    <main className="container py-10 space-y-8">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">Study Planner</p>
        <div>
          <h1 className="text-4xl font-black text-white">Daily Learning Roadmap</h1>
          <p className="max-w-2xl text-slate-400 mt-3">
            Your planner combines focus blocks, recovery periods, and priority tasks so every study session stays aligned with your goals.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,_0.6fr]">
        <Card className="bg-[#0a0a0a] border-white/10 shadow-xl">
          <CardHeader className="border-b border-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white">Today’s Focus Plan</CardTitle>
                <CardDescription className="text-slate-500">A structured agenda for study flow, breaks, and progress checks.</CardDescription>
              </div>
              <Button variant="outline" className="text-slate-300 border-white/10 hover:border-primary hover:text-primary">
                <CalendarDays className="h-4 w-4 mr-2" /> Weekly View
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {plannerBlocks.map((block) => (
              <div key={block.time} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400 uppercase tracking-[0.3em] font-bold">{block.time}</p>
                    <h3 className="text-lg font-bold text-white mt-2">{block.title}</h3>
                  </div>
                  <div className="text-slate-300 bg-white/5 rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] font-semibold">Planned</div>
                </div>
                <p className="mt-3 text-slate-400 text-sm">{block.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card className="bg-[#0a0a0a] border-white/10 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Sparkle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.3em] font-bold">Quick Wins</p>
                <h2 className="text-white font-black">Stay on Track</h2>
              </div>
            </div>
            <div className="space-y-3 text-slate-400 text-sm">
              <p>• Alternate heavy tasks with review sessions to maintain retention.</p>
              <p>• Use the last hour for active recall and progress audit.</p>
              <p>• Log what you learn after each focus block to reinforce memory.</p>
            </div>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10 shadow-xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white text-lg">Planner Summary</CardTitle>
            </CardHeader>
            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex justify-between gap-2">
                <span>Focus Blocks</span>
                <span>5</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Breaks</span>
                <span>3</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Review Blocks</span>
                <span>2</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Notifications due</span>
                <span>4</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  </div>
);

export default Planner;
