import DashboardNavBar from "@/components/DashboardNavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Clock, MessageSquare } from "lucide-react";

const notifications = [
  { title: "Assignment deadline approaching", time: "Today, 6:00 PM", message: "Submit Mathematics assignment before midnight to keep the plan balanced." },
  { title: "Live revision session", time: "Tomorrow, 9:00 AM", message: "Join the group review for Physics formulas and sample problems." },
  { title: "Planner sync reminder", time: "In 2 hours", message: "Refresh your planner to lock in your updated study cycle." },
];

const Notifications = () => (
  <div className="min-h-screen bg-[#050505] text-slate-200">
    <DashboardNavBar />
    <main className="container py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">Study Alerts</p>
        <h1 className="text-4xl font-black text-white mt-3">Notifications</h1>
        <p className="max-w-2xl text-slate-400 mt-3">
          Stay on top of exam reminders, planner updates and personalized study alerts from your AI assistant.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {notifications.map((item, index) => (
          <Card key={index} className="bg-[#0a0a0a] border-white/10 shadow-xl">
            <CardHeader className="border-b border-white/5 p-6 flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                {index === 0 ? <Bell className="h-5 w-5" /> : index === 1 ? <MessageSquare className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                <CardDescription className="text-slate-500">{item.time}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-slate-300">{item.message}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Notifications;
