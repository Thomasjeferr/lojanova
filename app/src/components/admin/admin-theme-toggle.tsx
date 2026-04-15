"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "./admin-theme-context";

export function AdminThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/90 text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition",
        "hover:border-zinc-300/90 hover:text-zinc-900",
        "dark:border-zinc-600/50 dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]",
        "dark:hover:border-zinc-500/60 dark:hover:bg-zinc-800 dark:hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35",
        className,
      )}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
