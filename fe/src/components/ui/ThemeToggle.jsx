"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-md bg-(--bg-elevated)" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group flex h-9 w-9 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-muted)"
      title={`Beralih ke mode ${isDark ? "Terang" : "Gelap"}`}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform group-hover:rotate-45" />
      ) : (
        <Moon
          size={16}
          className="transition-transform group-hover:-rotate-12"
        />
      )}
    </button>
  );
}
