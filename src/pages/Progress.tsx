import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import DashboardNavBar from "@/components/DashboardNavBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";

const subjects = [
  { name: "Mathematics", progress: 75, completed: 15, total: 20 },
  { name: "Physics", progress: 50, completed: 10, total: 20 },
  { name: "Chemistry", progress: 30, completed: 6, total: 20 },
  { name: "English", progress: 90, completed: 18, total: 20 },
];

const ProgressPage = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <DashboardNavBar />
    <main className="flex-1 py-10">
      <div className="container">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground mb-8">Track your study progress across subjects.</p>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">49</p>
                <p className="text-sm text-muted-foreground">Topics Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">31</p>
                <p className="text-sm text-muted-foreground">Topics Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">61%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <div className="grid gap-4">
          {subjects.map((s) => (
            <Card key={s.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-semibold text-foreground">{s.name}</h3>
                  <span className="text-sm text-muted-foreground">{s.completed}/{s.total} topics</span>
                </div>
                <ProgressBar value={s.progress} className="h-3" />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{s.progress}% complete</span>
                  <span className={s.progress >= 70 ? "text-secondary" : "text-primary"}>
                    {s.progress >= 70 ? "On Track" : "Needs Attention"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ProgressPage;
