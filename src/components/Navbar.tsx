import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Brain, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

const navItems = [
  { label: "Home", href: "/", scroll: null },
  { label: "How It Works", href: "/#how-it-works", scroll: "how-it-works" },
  { label: "About Us", href: "/#about", scroll: "about" },
  { label: "Contact", href: "/#contact", scroll: "contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [subjectName, setSubjectName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const STORAGE_KEY = "ai_study_planner_subjects";

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

  const addSubjectQuick = (name: string) => {
    if (!name.trim()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ id: genId(), name: name.trim(), notes: "" });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      setSubjectName("");
      setShowAdd(false);
    } catch (e) {
      console.warn("Failed to add subject", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileOpen(false);
    if (item.scroll) {
      if (location.pathname === "/") {
        document.getElementById(item.scroll)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(item.scroll!)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <nav className="sticky top-6 z-50 bg-transparent">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
          <Brain className="h-6 w-6 text-primary" />
          AI Study Planner
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.scroll ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                    className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            )
          )}
          <Button size="lg" className="px-5 py-2 text-lg rounded-full" asChild>
            {isLoggedIn ? (
              <Link to="/dashboard">Go to Dashboard</Link>
            ) : (
              <Link to="/login">Login / Signup</Link>
            )}
          </Button>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              {showAdd ? (
                <div className="flex items-center gap-2">
                  <input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Add subject"
                    className="rounded-full px-3 py-1 text-sm bg-popover border border-ui text-fg outline-none"
                  />
                  <Button onClick={() => addSubjectQuick(subjectName)} size="sm">Add</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setSubjectName(""); }}>Cancel</Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Subject
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card md:hidden">
          <div className="container flex flex-col gap-3 py-3">
            {navItems.map((item) =>
              item.scroll ? (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="text-left text-base font-medium text-muted-foreground hover:text-primary"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-base font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
              <Button size="lg" className="w-fit px-5 py-2 text-lg rounded-full" asChild>
                {isLoggedIn ? (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Go to Dashboard</Link>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Login / Signup</Link>
                )}
              </Button>
              {isLoggedIn && (
                <div className="pt-2">
                  {showAdd ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="Add subject"
                        className="rounded-full px-3 py-1 text-sm bg-popover border border-ui text-fg outline-none w-full"
                      />
                      <Button onClick={() => { addSubjectQuick(subjectName); setMobileOpen(false); }} size="sm">Add</Button>
                      <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setSubjectName(""); setMobileOpen(false); }}>Cancel</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => { setShowAdd(true); setMobileOpen(false); }} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Subject
                    </Button>
                  )}
                </div>
              )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
