import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Clock, MessageSquare } from "lucide-react";

const notifications = [
  {
    title: "Assignment deadline approaching",
    time: "Today, 6:00 PM",
    message: "Submit Mathematics assignment before midnight to keep the plan balanced.",
    icon: Bell,
  },
  {
    title: "Live revision session",
    time: "Tomorrow, 9:00 AM",
    message: "Join the group review for Physics formulas and sample problems.",
    icon: MessageSquare,
  },
  {
    title: "Planner sync reminder",
    time: "In 2 hours",
    message: "Refresh your planner to lock in your updated study cycle.",
    icon: Clock,
  },
];

const Notifications = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-primary font-black">Study Alerts</p>
      <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))] mt-2">
        Notifications
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Stay on top of exam reminders, planner updates and personalized study alerts from your AI
        assistant.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {notifications.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className="shadow-xl"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <CardHeader className="border-b border-ui p-6 flex flex-row items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary flex-shrink-0">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-[hsl(var(--foreground))] text-lg">{item.title}</CardTitle>
                <CardDescription className="text-slate-500">{item.time}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 text-muted-foreground">{item.message}</CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);

export default Notifications;
