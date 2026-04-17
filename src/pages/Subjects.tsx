import SubjectsSection from "@/components/SubjectsSection";

const Subjects = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">
        Subjects Planner
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Add, update and manage your current subjects. The planner structure helps you map subject
        work to your personalized study flow.
      </p>
    </div>
    <SubjectsSection />
  </div>
);

export default Subjects;
