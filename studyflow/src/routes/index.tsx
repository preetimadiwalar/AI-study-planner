import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  TrendingUp,
  Bell,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  BarChart3,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { GlitterBackground } from "@/components/GlitterBackground";
import heroStudent from "@/assets/hero-boy.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyFlow — AI Study Planner that adapts to you" },
      {
        name: "description",
        content:
          "Smart timetables, difficulty-based prioritization, progress tracking, and reminders. Plan smarter, study calmer.",
      },
      { property: "og:title", content: "StudyFlow — AI Study Planner" },
      {
        property: "og:description",
        content: "Smart timetables and progress tracking for focused students.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Sparkles,
    title: "Smart timetable",
    desc: "Auto-generate a balanced study plan based on your subjects, syllabus, and free hours.",
  },
  {
    icon: BookOpen,
    title: "Difficulty-based priority",
    desc: "Hard subjects and closer exams get more focused study sessions, automatically.",
  },
  {
    icon: TrendingUp,
    title: "Progress tracking",
    desc: "See completed sessions, streaks, and per-subject progress at a glance.",
  },
  {
    icon: Bell,
    title: "Reminders & nudges",
    desc: "Daily and weekly nudges keep you on track without overwhelming you.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Page-wide animated glitter — stays visible while scrolling */}
      <GlitterBackground count={120} fixed />

      {/* Nav */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left animate-fade-in">
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered study planning
            </span>
            <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight">
              Plan smarter.{" "}
              <span className="text-gradient-brand">Study calmer.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              StudyFlow turns your subjects, syllabus, and exam dates into a clear,
              balanced timetable — and tracks your progress as you go.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link to="/signup">
                  Start planning free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card. Free forever for students.
            </p>
          </div>

          {/* Right: animated illustration */}
          <div className="relative h-[380px] sm:h-[460px] flex items-center justify-center">
            {/* Soft glow halo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-gradient-to-br from-primary/25 to-accent/30 blur-3xl animate-pulse-soft" />
            </div>

            {/* Floating dashboard chips */}
            <div className="absolute top-6 left-2 sm:left-6 z-20 animate-hero-float">
              <div
                className="flex items-center gap-2 bg-card/90 backdrop-blur border rounded-2xl px-3 py-2 shadow-[var(--shadow-elevated)]"
                style={{ animationDelay: "0.5s" }}
              >
                <span className="h-8 w-8 rounded-lg gradient-brand text-primary-foreground flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Next session
                  </p>
                  <p className="text-xs font-semibold">Physics · 4:00 PM</p>
                </div>
              </div>
            </div>

            <div
              className="absolute top-20 right-2 sm:right-6 z-20 animate-hero-float"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center gap-2 bg-card/90 backdrop-blur border rounded-2xl px-3 py-2 shadow-[var(--shadow-elevated)]">
                <span className="h-8 w-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <BarChart3 className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Weekly progress
                  </p>
                  <p className="text-xs font-semibold text-success">+18%</p>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-10 left-4 sm:left-12 z-20 animate-hero-float"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-2 bg-card/90 backdrop-blur border rounded-2xl px-3 py-2 shadow-[var(--shadow-elevated)]">
                <span className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                  <Brain className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    AI tip ready
                  </p>
                  <p className="text-xs font-semibold">Review chapter 3</p>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-6 right-4 sm:right-10 z-20 animate-hero-float"
              style={{ animationDelay: "2.8s" }}
            >
              <div className="flex items-center gap-2 bg-card/90 backdrop-blur border rounded-2xl px-3 py-2 shadow-[var(--shadow-elevated)]">
                <span className="h-8 w-8 rounded-lg gradient-brand text-primary-foreground flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Streak
                  </p>
                  <p className="text-xs font-semibold">7 days 🔥</p>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative z-10 animate-hero-float">
              <img
                src={heroStudent}
                alt="Illustration of a student studying with StudyFlow"
                width={420}
                height={420}
                className="h-72 w-72 sm:h-96 sm:w-96 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Everything you need to stay on top of exams
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for students who want focus without the friction of complex tools.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border bg-card p-6 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-xl gradient-brand text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-20 border-t bg-muted/30 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Three steps to a calmer study routine
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Add your subjects", d: "Syllabus, difficulty, and exam date." },
              { n: "2", t: "Generate a timetable", d: "We balance hard and urgent subjects." },
              { n: "3", t: "Track and adapt", d: "Mark sessions done — see real progress." },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl bg-card border p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
              >
                <span className="text-sm font-semibold text-primary">Step {s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link to="/signup">Create your free account</Link>
            </Button>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Secure & private
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StudyFlow. Built for focused students.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
