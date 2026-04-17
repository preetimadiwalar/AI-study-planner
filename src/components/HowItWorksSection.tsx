const steps = [
  { number: "01", title: "Add Your Subjects", desc: "Enter the subjects you're studying and your syllabus topics." },
  { number: "02", title: "Set Exam Dates", desc: "Tell us when your exams are so we can plan around deadlines." },
  { number: "03", title: "Get Your Smart Plan", desc: "Receive an AI-optimized study schedule tailored to your needs." },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 md:py-32 relative bg-transparent overflow-hidden font-body">
    <div className="container relative z-10">
      <div className="mb-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
           <span className="text-primary font-bold text-lg">//</span>
           <span className="text-primary font-bold text-xs tracking-[0.3em] uppercase">The Process</span>
        </div>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-fg tracking-tight">
          How It <span className="text-primary">Works.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg font-light max-w-2xl mx-auto">
          Deploying your study routine in three tactical phases. Simple, fast, and optimized.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="group relative rounded-2xl border-2 border-ui bg-popover p-10 transition-all duration-500 hover:border-primary/50 hover:bg-primary/[0.05] overflow-hidden"
          >
            {/* Architectural Background Number */}
            <span className="absolute -top-6 -right-4 font-heading text-9xl font-black text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
              {step.number}
            </span>

            <div className="relative z-10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 text-primary font-heading text-2xl font-black shadow-[0_0_15px_rgba(255,0,0,0.2)] group-hover:bg-primary group-hover:text-black transition-all duration-300">
                    {step.number}
                </div>
                <h3 className="mb-4 font-heading text-xl font-bold text-fg uppercase tracking-tight">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-light">{step.desc}</p>
            </div>

            {/* Hover Glow */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

