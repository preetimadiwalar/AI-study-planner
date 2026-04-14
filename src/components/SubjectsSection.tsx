import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Edit2, Loader2 } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  code?: string;
  user_id: string;
  created_at?: string;
};

const SubjectsSection: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast.error("Failed to load subjects: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("subjects")
          .update({ name: name.trim(), code })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Subject updated successfully");
      } else {
        const { error } = await supabase
          .from("subjects")
          .insert([{ name: name.trim(), code, user_id: session.user.id }]);

        if (error) throw error;
        toast.success("Subject added successfully");
      }

      resetForm();
      fetchSubjects();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;

    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Subject deleted successfully");
      fetchSubjects();
      if (editingId === id) resetForm();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a0a0a] border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-primary" />
            {editingId ? "Edit Subject" : "Add New Subject"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Subject Title</label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex-[2] space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Subject Code</label>
              <Input 
                placeholder="e.g. CS101" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-11 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleAdd} 
                disabled={submitting}
                className="h-11 bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Update Subject" : "Register Subject"}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm} className="h-11 text-slate-400 hover:text-white">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-white/10 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 p-4 flex flex-row items-center justify-between bg-white/5">
          <CardTitle className="text-white text-lg">Subject Repository</CardTitle>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {subjects.length} active units
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-medium">No subjects detected in core database.</p>
              <p className="text-xs text-slate-600 mt-1">Initialize subjects using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Subject Name</TableHead>
                    <TableHead className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Code</TableHead>
                    <TableHead className="text-right text-slate-500 font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((sub) => (
                    <TableRow key={sub.id} className="border-white/5 hover:bg-white/2 transition-all group">
                      <TableCell className="font-bold text-white py-4">{sub.name}</TableCell>
                      <TableCell className="text-slate-400 text-sm py-4">{sub.code || "—"}</TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(sub)}
                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(sub.id)}
                            className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsSection;
