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
        "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-all duration-150",
        "hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
        className,
      )}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden strokeWidth={2} />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden strokeWidth={2} />
      )}
    </button>
  );
}
