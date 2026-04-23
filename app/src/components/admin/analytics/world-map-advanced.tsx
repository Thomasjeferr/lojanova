"use client";

import { ActivityMaplibreCore } from "@/components/admin/activity/activity-maplibre-core";
import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { cn } from "@/lib/utils";

type WorldMapAdvancedProps = {
  points: ActivityMapPointDTO[];
  className?: string;
  minHeight?: number;
  showHeatmap?: boolean;
  liveMode?: boolean;
  /** Muda com filtros de analytics → novo enquadramento automático */
  fitBoundsKey?: string;
};

/**
 * Mapa de atividade avançado (MapLibre): vetor, clusters, heatmap opcional.
 */
export function WorldMapAdvanced({
  className,
  showHeatmap = true,
  minHeight = 460,
  points,
  liveMode: _liveMode = true,
  fitBoundsKey,
}: WorldMapAdvancedProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -inset-[3px] overflow-hidden rounded-[1.18rem] opacity-90"
        aria-hidden
      >
        <div
          className="analytics-cf-orbit absolute -inset-[40%] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(167,139,250,0.35),transparent_25%,rgba(34,211,238,0.2),transparent_50%,rgba(244,114,182,0.15),transparent_75%,rgba(167,139,250,0.3))] blur-2xl"
          aria-hidden
        />
      </div>
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-[1.12rem] bg-gradient-to-br from-violet-500/35 via-fuchsia-500/20 to-cyan-400/25 opacity-70 blur-md"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.05rem] bg-gradient-to-tr from-white/[0.06] via-transparent to-violet-400/10 opacity-90"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl shadow-[0_0_100px_-18px_rgba(139,92,246,0.55),0_0_60px_-12px_rgba(34,211,238,0.12),0_32px_64px_-28px_rgba(0,0,0,0.88)] ring-1 ring-white/[0.14]">
        <ActivityMaplibreCore
          points={points}
          minHeight={minHeight}
          variant="dark"
          showHeatmap={showHeatmap}
          showLegend
          fitBoundsKey={fitBoundsKey}
        />
      </div>
    </div>
  );
}
