import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const heroIllustration = "/boy.png";

const HeroSection = () => (
  <section
    className="relative overflow-hidden py-24 md:py-36 min-h-[90vh] flex items-center"
  >
    {/* Clean Gradient Aura - REMOVED for full black background */}


    <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center animate-fade-up">
        {/* Left Side: Information */}
        <div className="flex flex-col items-start gap-8 text-left">
            <div className="flex items-center gap-3 mb-2">
               <span className="text-primary font-bold text-lg">//</span>
               <span className="text-primary font-bold text-xs tracking-[0.4em] uppercase text-primary/80">Intelligence Deployed</span>
            </div>
            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white uppercase max-w-4xl">
                AI Study <span className="text-primary drop-shadow-[0_0_20px_rgba(233,30,99,0.5)]">Learning.</span>
              </h1>
              <p className="max-w-xl text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                The next generation AI scheduling engine for elite academic performance. 
                Stop guessing, start executing your tactical roadmap.
              </p>
              <div className="mt-4">
                <Button size="lg" className="h-16 px-12 text-lg font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(233,30,99,0.4)] hover:shadow-[0_0_60px_rgba(233,30,99,0.6)] transition-all bg-primary hover:bg-primary/90 text-white rounded-full border-0" asChild>
                  <Link to="/login">Initialize Planner Scan</Link>
                </Button>
              </div>
        </div>

        {/* Right Side: Boy Illustration */}
        <div className="relative hidden lg:flex justify-center items-center rounded-[4rem] overflow-hidden border border-primary/10 bg-transparent p-4 group transition-all duration-700">
            <img
              src={heroIllustration}
              alt="AI Study Boy Illustration"
              className="w-full max-w-[600px] h-auto object-contain relative z-10 animate-fade-in opacity-50 filter saturate-[1.2] brightness-[1.1] mix-blend-screen drop-shadow-[0_0_30px_rgba(0,120,255,0.4)] rounded-[3rem]"
            />
            {/* Minimal Ambient Glow */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
        </div>
    </div>
  </section>
);






export default HeroSection;
