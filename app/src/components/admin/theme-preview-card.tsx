"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/lib/themes";
import { THEME_DEFINITIONS } from "@/lib/themes";

type ThemePreviewCardProps = {
  themeId: ThemeId;
  isActive: boolean;
  disabled?: boolean;
  loading?: boolean;
  onActivate: (id: ThemeId) => void;
};

export function ThemePreviewCard({
  themeId,
  isActive,
  disabled,
  loading,
  onActivate,
}: ThemePreviewCardProps) {
  const def = THEME_DEFINITIONS[themeId];

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition-all duration-300",
        "dark:border-zinc-700/70 dark:bg-zinc-900/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]",
        isActive
          ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-lg dark:border-indigo-400/80 dark:ring-indigo-500/25"
          : "border-zinc-200/90 hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-500",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {isActive && (
        <div className="absolute right-4 top-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-md dark:bg-indigo-500 dark:text-white">
            <Check className="h-3.5 w-3.5" />
            Ativo
          </span>
        </div>
      )}
      <div
        className="relative h-36 w-full shrink-0"
        style={{ background: def.previewGradient }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)]" />
        <div className="absolute bottom-3 left-4 right-4 flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-white/95 shadow-lg backdrop-blur-sm" />
          <div
            className="h-8 w-24 rounded-lg shadow-lg ring-1 ring-white/30"
            style={{ background: def.previewCtaGradient }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full ring-2 ring-white shadow"
            style={{ backgroundColor: def.accentHex }}
          />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{def.label}</h3>
        </div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{def.tagline}</p>
        <button
          type="button"
          disabled={disabled || loading || isActive}
          onClick={() => onActivate(themeId)}
          className={cn(
            "mt-6 w-full rounded-2xl py-3 text-sm font-semibold transition-all",
            isActive
              ? "cursor-default border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              : "bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 hover:shadow-xl active:scale-[0.98] dark:bg-indigo-600 dark:hover:bg-indigo-500",
          )}
        >
          {loading ? "Aplicando…" : isActive ? "Template ativo" : "Ativar template"}
        </button>
      </div>
    </div>
  );
}
