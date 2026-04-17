import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardNavBar from "@/components/DashboardNavBar";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/");

      const { data, error } = await supabase
        .from("users")
        .select(
          `id, full_name, email, phone_number, college_name, department, program, semester, roll_number`
        )
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Could not load profile");
      } else {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          college_name: data.college_name || "",
          department: data.department || "",
          program: data.program || "",
          semester: data.semester || "",
          roll_number: data.roll_number || "",
          email: data.email || session.user.email || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/");

      const updates = {
        full_name: form.full_name,
        phone_number: form.phone_number,
        college_name: form.college_name,
        department: form.department,
        program: form.program,
        semester: form.semester,
        roll_number: form.roll_number,
      };

      const { error } = await supabase.from("users").update(updates).eq("id", session.user.id);
      if (error) throw error;
      toast.success("Profile updated");
      setEditing(false);
      // refresh profile
      const { data } = await supabase.from("users").select().eq("id", session.user.id).single();
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <DashboardNavBar />
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 py-10">
        <h2 className="text-3xl font-black text-white text-center">Profile</h2>

        <Card className="bg-[#0a0a0a] border-white w-full">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-white">Account</CardTitle>
            <CardDescription className="text-slate-500">Your public and academic details</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">{profile?.full_name}</p>
                <p className="text-slate-400 text-sm">{profile?.college_name}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setEditing(!editing); }} className="bg-amber-400/10 text-amber-300 border border-amber-300/20 hover:bg-amber-400/20">{editing ? "Cancel" : "Edit"}</Button>
                {editing && (
                  <Button onClick={handleSave} className="bg-primary">Save</Button>
                )}
              </div>
            </div>

            {/* Clean form: show only signup-provided fields; email is read-only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Full name</Label>
                <Input className="border border-white" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} disabled={!editing} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Email</Label>
                <Input className="border border-white" value={form.email} disabled />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Phone</Label>
                <Input className="border border-white" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} disabled={!editing} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Roll / USN</Label>
                <Input className="border border-white" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} disabled={!editing} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Department</Label>
                <Input className="border border-white" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={!editing} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Program</Label>
                <Select onValueChange={(v) => setForm({ ...form, program: v })} value={form.program}>
                  <SelectTrigger className="w-full border border-white" disabled={!editing}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BE/B.Tech">BE/B.Tech</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                    <SelectItem value="B.Sc">B.Sc</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="Polytechnic">Polytechnic</SelectItem>
                    <SelectItem value="B Com">B Com</SelectItem>
                    <SelectItem value="Law">Law</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Semester</Label>
                <Select onValueChange={(v) => setForm({ ...form, semester: v })} value={form.semester}>
                  <SelectTrigger className="w-full border border-white" disabled={!editing}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((n) => (
                      <SelectItem key={n} value={`Sem ${n}`}>Sem {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">College</Label>
                <Input className="border border-white" value={form.college_name} onChange={(e) => setForm({ ...form, college_name: e.target.value })} disabled={!editing} />
              </div>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
