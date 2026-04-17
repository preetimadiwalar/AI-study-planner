import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "site-theme";

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved as Theme;
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return "light";
    }
    return "dark";
  });

  useEffect(() => {
    try {
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY, "light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        localStorage.setItem(STORAGE_KEY, "dark");
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, setTheme, toggle } as const;
}
