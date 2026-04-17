import DashboardNavBar from "@/components/DashboardNavBar";
import SubjectsSection from "@/components/SubjectsSection";

const Subjects = () => (
  <div className="min-h-screen bg-[#050505] text-slate-200">
    <DashboardNavBar />
    <main className="container py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">Study Management</p>
        <h1 className="text-4xl font-black text-white mt-3">Subjects Planner</h1>
        <p className="max-w-2xl text-slate-400 mt-3">
          Add, update and manage your current subjects. The planner structure helps you map subject work to your personalized study flow.
        </p>
      </div>
      <SubjectsSection />
    </main>
  </div>
);

export default Subjects;
