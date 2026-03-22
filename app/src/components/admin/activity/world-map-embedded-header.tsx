"use client";

import { MapPin } from "lucide-react";

export function WorldMapEmbeddedHeader() {
  return (
    <header className="border-b border-zinc-100/95 bg-gradient-to-b from-white to-zinc-50/40 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600/90 sm:text-[11px]">
            <MapPin className="h-3 w-3 shrink-0 text-violet-500" aria-hidden />
            Geografia
          </p>
          <h3 className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
            Mapa de eventos
          </h3>
          <p className="max-w-md text-[11px] leading-relaxed text-zinc-500 sm:text-xs">
            Origem aproximada dos eventos.{" "}
            <span className="text-zinc-600">
              Arraste para mover · role para zoom · use +/−
            </span>
          </p>
        </div>
      </div>
    </header>
  );
}
