import { Brain, Target, Lightbulb, Users, Sparkles, BookOpen, Clock, BarChart3, ChevronRight, Zap, Target as TargetIcon, Trophy, Globe } from "lucide-react";

const stats = [
  { value: "10K+", label: "ACTIVE STUDENTS" },
  { value: "95%", label: "EXAM PASS RATE" },
  { value: "50K+", label: "PLANS GENERATED" },
  { value: "FREE", label: "TO GET STARTED" },
];

const features = [
  { 
    icon: Zap, 
    title: "AI SCHEDULING ENGINE", 
    desc: "Built directly on advanced LLMs and spaced-repetition algorithms. Production-grade planning from day one." 
  },
  { 
    icon: TargetIcon, 
    title: "ADAPTIVE LEARNING FOCUS", 
    desc: "Tackle difficult subjects using machine learning insights that adapt to your progress in real-time." 
  },
  { 
    icon: Trophy, 
    title: "ACHIEVEMENTS & ANALYTICS", 
    desc: "Visualize your journey with readiness scores, streaks, and industrial-grade educational insights." 
  },
  { 
    icon: Globe, 
    title: "ACCESSIBLE TO ALL", 
    desc: "Whether you are a student or a professional, our platform provides professional-grade tools for everyone." 
  },
];

const AboutSection = () => (
  <section id="about" className="py-24 md:py-32 relative bg-transparent overflow-hidden font-body">
    {/* High-Intensity Background Glows */}
    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

    {/* Animated Red Particles / Lines */}
    <div className="absolute top-0 right-0 w-[500px] h-full opacity-30 pointer-events-none select-none">
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
            <div className="absolute w-80 h-[85%] border-l-2 border-r-2 border-primary/30 rotate-12 -skew-x-12 animate-pulse" />
        </div>
    </div>

    <div className="container relative z-10 px-6">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Left Column: Title + Stats */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="text-primary font-bold text-lg">//</span>
               <span className="text-primary font-bold text-xs tracking-[0.3em] uppercase">What is AI Study Planner</span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Where Study <span className="text-primary">Evolves.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg font-light">
              AI Study Planner is a high-stakes educational engine powered by advanced intelligence. Students and professionals come together to build real knowledge through personalized roadmaps—under pressure, with purpose.
            </p>
          </div>

          {/* Stats Grid 2x2 */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            {stats.map((s) => (
              <div key={s.label} className="border border-white/5 bg-white/[0.02] p-6 group hover:border-primary/50 transition-all duration-300">
                <p className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform origin-left">{s.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Feature List */}
        <div className="relative pt-4 space-y-12">
            {/* Vertical separator line for desktop */}
            <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
            
            <div className="space-y-12">
                {features.map((f, i) => (
                    <div key={f.title} className="flex gap-6 group">
                        <div className="flex-shrink-0 pt-1">
                            <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-all duration-300">
                                <f.icon className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-white tracking-widest uppercase">{f.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md font-light">
                                {f.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  </section>
);

export default AboutSection;


