"use client";

import { MapPin } from "lucide-react";

export function WorldMapEmbeddedHeader() {
  return (
    <header className="shrink-0 border-b border-zinc-100/95 bg-gradient-to-b from-white to-zinc-50/40 px-3 py-2 sm:px-4 sm:py-2.5 dark:border-zinc-800/80 dark:from-zinc-900/95 dark:to-zinc-950/80">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600/90 sm:text-[10px]">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-violet-500" aria-hidden />
            Geografia
          </p>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 sm:text-base dark:text-zinc-50">
            Mapa de eventos
          </h3>
        </div>
        <p className="line-clamp-1 max-w-md text-[10px] leading-relaxed text-zinc-500 sm:max-w-none sm:text-[11px] sm:leading-snug dark:text-zinc-400">
          <span className="text-zinc-500 dark:text-zinc-500">MapLibre</span> ·
          origem aprox. · clique no cluster.{" "}
          <span className="text-zinc-600 dark:text-zinc-500">
            Arraste · roda zoom · +/−
          </span>
        </p>
      </div>
    </header>
  );
}
