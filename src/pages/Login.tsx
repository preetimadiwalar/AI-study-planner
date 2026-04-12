import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Store additional user data in 'users' table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id, 
                full_name: name, 
                email: email,
                phone_number: phone,
                college_name: college,
                department: department,
                program: program,
                semester: semester,
                roll_number: rollNumber,
                created_at: new Date().toISOString() 
              }
            ]);
          
          if (profileError) console.error("Profile error:", profileError);
        }

        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // Log in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.message === "Invalid login credentials") {
        toast.error("Invalid credentials. If you haven't created an account yet, please click 'Sign Up' below.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
      </div>

      <div className="w-full max-w-md lg:max-w-xl mx-auto z-10">
        <Card className={`${isSignup ? "max-w-xl" : "max-w-md"} mx-auto animate-fade-up glass-panel border-white/10 shadow-2xl shadow-primary/5`}>
          <CardHeader className={`text-center ${isSignup ? "py-4" : "py-6"}`}>
              {/* Show back link only on Login view (hide on Sign Up) */}
              {!isSignup && (
                <div className="w-full flex justify-start mb-2">
                  <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                  </Link>
                </div>
              )}

              <Link to="/" className="mx-auto mb-1 flex items-center gap-2 font-heading text-lg font-bold text-foreground hover:scale-105 transition-transform">
                <Brain className="h-5 w-5 text-primary" />
                AI Study Planner
              </Link>
            <CardTitle className={`font-bold tracking-tight ${isSignup ? "text-xl" : "text-2xl"}`}>{isSignup ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {isSignup ? "Fill in your details to start the challenge." : "Log in to your study planner"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className={isSignup ? "space-y-3" : "space-y-4"}>
              {isSignup ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 (555) 000-0000" 
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">College Name</Label>
                      <Input 
                        id="college" 
                        placeholder="University Name" 
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dept" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</Label>
                      <Input 
                        id="dept" 
                        placeholder="e.g., CS, IS" 
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="program" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Program</Label>
                      <Select onValueChange={setProgram} value={program}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 focus:border-primary/50">
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-foreground">
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
                    <div className="space-y-1.5">
                      <Label htmlFor="semester" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Semester</Label>
                      <Select onValueChange={setSemester} value={semester}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 focus:border-primary/50">
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-white/10 text-foreground">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={`Sem ${num}`}>
                              Sem {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                    <div className="space-y-1">
                    <Label htmlFor="roll" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">USN / Roll Number</Label>
                    <Input 
                      id="roll" 
                      placeholder="USN / Roll Number" 
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="bg-white/5 border-white/10 focus:border-primary/50 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" name="password-label" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                      <button type="button" className="text-[10px] text-primary hover:underline italic">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
              <CardFooter className={`flex flex-col gap-3 ${isSignup ? "pt-2" : "pt-4"}`}>
                <Button type="submit" className="w-full h-11 text-base font-bold shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] transition-all bg-primary hover:bg-primary/90 text-white" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing...
                    </span>
                  ) : (isSignup ? "Create Free Account" : "Login")}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  {isSignup ? "Already tracking your goals?" : "New to the challenge?"}{" "}
                  <button 
                    type="button" 
                    onClick={() => setIsSignup(!isSignup)} 
                    className="text-primary font-bold hover:underline"
                  >
                    {isSignup ? "Log In" : "Sign Up Now"}
                  </button>
                </p>
              </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
