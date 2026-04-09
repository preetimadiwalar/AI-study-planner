import { CalendarDays, BarChart3, TrendingUp, Bell } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Smart Timetable Generation",
    description: "Automatically creates optimized daily and weekly study schedules.",
  },
  {
    icon: BarChart3,
    title: "Difficulty-Based Prioritization",
    description: "Allocates more time to challenging subjects for better understanding.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking & Suggestions",
    description: "Track completed topics and receive study improvement suggestions.",
  },
  {
    icon: Bell,
    title: "Reminders & Notifications",
    description: "Get alerts for upcoming exams and scheduled study sessions.",
  },
];

const FeaturesSection = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="mb-14 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl neo-glow-text">
          Key Features
        </h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to ace your exams with confidence.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-primary">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold text-foreground neo-glow-text">{f.title}</h3>

            <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
