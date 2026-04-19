import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — StudyFlow" },
      {
        name: "description",
        content:
          "Get in touch with the StudyFlow team. Questions, feedback, or partnership ideas — we'd love to hear from you.",
      },
      { property: "og:title", content: "Contact StudyFlow" },
      {
        property: "og:description",
        content: "Questions, feedback, or partnership ideas — get in touch.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Frontend-only demo: just show a success toast.
    setTimeout(() => {
      setSending(false);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Thanks! We'll get back to you soon.");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <section className="gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/10">
            <MessageCircle className="h-3.5 w-3.5" />
            Contact us
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
            Let's <span className="text-gradient-brand">talk.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Questions, feedback, or partnership ideas — drop us a message and we'll get
            back to you.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Get in touch</h2>
              <p className="text-sm text-muted-foreground mt-2">
                We typically respond within 1–2 business days.
              </p>
            </div>
            <ul className="space-y-4">
              <ContactRow
                icon={Mail}
                label="Email"
                value="hello@studyflow.app"
              />
              <ContactRow
                icon={MessageCircle}
                label="Support"
                value="support@studyflow.app"
              />
              <ContactRow
                icon={MapPin}
                label="Location"
                value="Remote — students worldwide"
              />
            </ul>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm font-medium">Looking for help inside the app?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Most questions are answered on your{" "}
                <Link to="/dashboard" className="text-primary hover:underline">
                  Dashboard
                </Link>{" "}
                once you sign in.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border bg-card p-6 sm:p-8 space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Student"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" disabled={sending} className="w-full sm:w-auto gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </p>
        <p className="font-medium">{value}</p>
      </div>
    </li>
  );
}

function SiteNav() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-foreground font-medium">
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
