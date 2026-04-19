import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, differenceInCalendarDays } from "date-fns";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import {
  addSubject,
  getSubjects,
  removeSubject,
  type Difficulty,
} from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  const user = useAuth();
  const qc = useQueryClient();
  const subjects = useStore<Awaited<ReturnType<typeof getSubjects>>>(
    ["subjects", user?.id],
    () => (user ? getSubjects(user.id) : Promise.resolve([])),
    [],
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [examDate, setExamDate] = useState("");

  if (!user) return null;

  const today = new Date();

  const reset = () => {
    setName("");
    setSyllabus("");
    setDifficulty("medium");
    setExamDate("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addSubject(user.id, {
        name: name.trim(),
        syllabus: syllabus.trim(),
        difficulty,
        examDate: examDate || undefined,
      });
      qc.invalidateQueries({ queryKey: ["subjects", user.id] });
      toast.success(`Added ${name}`);
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add subject.");
    }
  };

  const onDelete = async (id: string, subjectName: string) => {
    if (!confirm(`Delete "${subjectName}"? Related study sessions will be removed.`)) return;
    try {
      await removeSubject(user.id, id);
      qc.invalidateQueries({ queryKey: ["subjects", user.id] });
      qc.invalidateQueries({ queryKey: ["planner", user.id] });
      toast.success("Subject deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  };

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Add what you're studying. Difficulty and exam date drive your timetable."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add subject</DialogTitle>
                <DialogDescription>
                  Include the syllabus topics so we can plan around them.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Subject name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="syllabus">Syllabus / topics</Label>
                  <Textarea
                    id="syllabus"
                    rows={3}
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="Calculus, Linear algebra, Probability…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(v) => setDifficulty(v as Difficulty)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exam">Exam date</Label>
                    <Input
                      id="exam"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add subject</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {subjects.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <span className="h-12 w-12 mx-auto rounded-2xl gradient-brand text-primary-foreground flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold">No subjects yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Add the subjects you're studying. We'll use difficulty and exam dates to
            generate a balanced plan.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-5 gap-2">
            <Plus className="h-4 w-4" /> Add your first subject
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => {
            const days = s.examDate
              ? differenceInCalendarDays(new Date(s.examDate), today)
              : null;
            return (
              <div key={s.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {s.difficulty} difficulty
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(s.id, s.name)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                    aria-label="Delete subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {s.syllabus && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                    {s.syllabus}
                  </p>
                )}
                {s.examDate && (
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Exam: {format(new Date(s.examDate), "MMM d, yyyy")}
                    </span>
                    <span
                      className={`font-semibold px-2 py-1 rounded-md ${
                        days !== null && days <= 3
                          ? "bg-destructive/10 text-destructive"
                          : days !== null && days <= 7
                            ? "bg-warning/15 text-warning"
                            : "bg-primary-soft text-primary"
                      }`}
                    >
                      {days === 0 ? "Today" : days && days > 0 ? `in ${days}d` : "Past"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
