"use client";

import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { cn } from "@/lib/utils";
import { ActivityMaplibreCore } from "./activity-maplibre-core";
import { WorldMapEmbeddedHeader } from "./world-map-embedded-header";

type ActivityWorldMapProps = {
  points: ActivityMapPointDTO[];
  className?: string;
  minHeight?: number;
  embedded?: boolean;
  showHeatmap?: boolean;
  liveMode?: boolean;
};

/**
 * Mapa de atividade (MapLibre) — variantes do embed no dashboard e cartão desencaixado.
 * `showHeatmap` e `liveMode` mantêm API compatível; heatmap podes ligar noutro contexto.
 */
export function ActivityWorldMap({
  points,
  className,
  minHeight = 420,
  embedded = false,
  showHeatmap = false,
}: ActivityWorldMapProps) {
  const inner = (
    <ActivityMaplibreCore
      points={points}
      minHeight={minHeight}
      variant={embedded ? "embedded" : "dark"}
      showHeatmap={showHeatmap}
      showLegend
      lightBasemap={embedded}
      fillHeight={embedded}
      className={cn(!embedded && "min-h-0", embedded && "min-h-0 flex-1")}
    />
  );

  if (embedded) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/85 bg-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_20px_56px_-28px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.03)]",
          "ring-1 ring-zinc-950/[0.035] transition-shadow duration-300",
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_26px_64px_-28px_rgba(15,23,42,0.16)]",
          "dark:border-zinc-700/50 dark:bg-zinc-900/40 dark:ring-zinc-800/60",
          "dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "dark:hover:shadow-[0_24px_56px_-24px_rgba(0,0,0,0.6)]",
          className,
        )}
      >
        <WorldMapEmbeddedHeader />
        {inner}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800/55",
        "bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950",
        "shadow-[0_28px_90px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04]",
        className,
      )}
      style={{ minHeight }}
    >
      {inner}
    </div>
  );
}
