"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

// Must match the init script in src/app/layout.tsx
const THEME_STORAGE_KEY = "tavola.theme";

export function ThemeToggle() {
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // private mode — theme still toggles, it just won't persist
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light mode"
      onClick={toggleTheme}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
