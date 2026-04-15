"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemePreviewCard } from "./theme-preview-card";
import { THEME_IDS, THEME_DEFINITIONS } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import type { SiteTheme } from "@prisma/client";

type ThemeSwitcherSectionProps = {
  currentTheme: SiteTheme;
  disabled?: boolean;
};

export function ThemeSwitcherSection({
  currentTheme,
  disabled,
}: ThemeSwitcherSectionProps) {
  const router = useRouter();
  const [active, setActive] = useState<SiteTheme>(currentTheme);
  const [loadingId, setLoadingId] = useState<ThemeId | null>(null);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setActive(currentTheme);
  }, [currentTheme]);

  async function handleActivate(themeId: ThemeId) {
    if (disabled || themeId === active) return;
    setLoadingId(themeId);
    setToast(null);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTheme: themeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast("error");
        setToastMsg(data.error || "Não foi possível alterar o template.");
        return;
      }
      setActive(themeId);
      setToast("success");
      setToastMsg("Template aplicado. O site público já usa o novo visual.");
      router.refresh();
      setTimeout(() => {
        setToast(null);
        setToastMsg("");
      }, 4500);
    } catch {
      setToast("error");
      setToastMsg("Erro de conexão.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Template atual</p>
        <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {THEME_DEFINITIONS[active].label}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {THEME_IDS.map((id) => (
          <ThemePreviewCard
            key={id}
            themeId={id}
            isActive={active === id}
            disabled={disabled}
            loading={loadingId === id}
            onActivate={handleActivate}
          />
        ))}
      </div>
      {toast && (
        <div
          role="status"
          className={
            toast === "success"
              ? "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900 shadow-xl dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-100"
              : "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900 shadow-xl dark:border-red-500/35 dark:bg-red-950/50 dark:text-red-100"
          }
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
