"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "sidebar" | "header";
};

export function LogoutButton({
  redirectTo = "/",
  className,
  children,
  variant = "sidebar",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        variant === "header" &&
          "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50",
        variant === "sidebar" &&
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50",
        className,
      )}
    >
      {children ?? (
        <>
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{loading ? "Saindo..." : "Sair"}</span>
        </>
      )}
    </button>
  );
}
