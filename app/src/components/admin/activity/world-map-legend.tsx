"use client";

import { cn } from "@/lib/utils";

const ITEMS = [
  {
    key: "purchase",
    label: "Compra",
    dotClass:
      "from-violet-300 to-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.55)] ring-violet-400/35",
    glow: "bg-violet-500",
  },
  {
    key: "login",
    label: "Login",
    dotClass:
      "from-sky-300 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.5)] ring-blue-400/35",
    glow: "bg-blue-500",
  },
  {
    key: "access",
    label: "Acesso",
    dotClass:
      "from-emerald-300 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.45)] ring-emerald-400/35",
    glow: "bg-emerald-500",
  },
] as const;

type WorldMapLegendProps = {
  embedded?: boolean;
  className?: string;
};

export function WorldMapLegend({ embedded, className }: WorldMapLegendProps) {
  return (
    <div
      className={cn(
        "pointer-events-none z-10 flex flex-wrap items-center justify-center gap-2 sm:justify-start",
        className,
      )}
      role="group"
      aria-label="Tipos de evento no mapa"
    >
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-md transition-[box-shadow,transform] duration-200 sm:text-xs",
            embedded
              ? "border-zinc-200/90 bg-white/[0.92] text-zinc-700 ring-1 ring-zinc-950/[0.04]"
              : "border-white/[0.1] bg-zinc-950/70 text-zinc-200 ring-1 ring-white/[0.05]",
          )}
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-45 blur-[4px]",
                item.glow,
              )}
            />
            <span
              className={cn(
                "relative h-3 w-3 rounded-full bg-gradient-to-br ring-2 ring-white/30",
                item.dotClass,
              )}
            />
          </span>
          <span className="whitespace-nowrap uppercase tracking-[0.08em]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
