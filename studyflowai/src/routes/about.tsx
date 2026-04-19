import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — StudyFlow" },
      {
        name: "description",
        content:
          "StudyFlow is built by students, for students — turning study plans into something calm and clear.",
      },
      { property: "og:title", content: "About StudyFlow" },
      {
        property: "og:description",
        content: "Built by students, for students. Calm, clear, AI-powered study planning.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Sparkles,
    title: "Calm by default",
    desc: "Less noise, fewer toggles. Just the plan you need for today and the week ahead.",
  },
  {
    icon: GraduationCap,
    title: "Built for real students",
    desc: "Designed around real syllabi, exam pressure, and the way focus actually works.",
  },
  {
    icon: Heart,
    title: "Privacy first",
    desc: "Your data stays on your device. No tracking, no selling, no surprises.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <section className="gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/10">
            <Users className="h-3.5 w-3.5" />
            About StudyFlow
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
            We're making study planning <span className="text-gradient-brand">feel calm again.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            StudyFlow started as a side project between students who were tired of
            messy notebooks, scattered to-do lists, and apps that asked too much before
            giving anything back.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Our mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Most students don't need another productivity app — they need a clear answer
            to <em>"what should I study right now?"</em>. StudyFlow turns your subjects,
            syllabus, and exam dates into a balanced plan, then quietly tracks your
            progress so you can focus on the work, not the planning.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We believe planning tools should reduce stress, not add to it. Every feature
            we ship is judged by one question: does this help a student feel calmer and
            more in control?
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            What we value
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl bg-card border p-6">
                  <div className="h-10 w-10 rounded-xl gradient-brand text-primary-foreground flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-t">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Ready to plan smarter?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Create a free account and generate your first timetable in under a minute.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/about" className="text-foreground font-medium">
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
  );
}

function SiteFooter() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} StudyFlow. Built for focused students.
        </p>
      </div>
    </footer>
  );
}
