import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Brain } from "lucide-react";
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
