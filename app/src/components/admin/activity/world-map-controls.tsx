"use client";

import { Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

type WorldMapControlsProps = {
  /** Modo clássico: zoom fator (ex. 0.6–2.85) */
  zoom: number;
  zoomMin: number;
  zoomMax: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  className?: string;
  /** Se definido, o % mostrado vem daqui (ex. MapLibre) */
  labelPercent?: number;
  /** Força desativar zoom in/out (ex. limites reais do mapa) */
  zoomAtMin?: boolean;
  zoomAtMax?: boolean;
  /** Volta a enquadrar os pontos */
  onRecenter?: () => void;
  recenterLabel?: string;
};

export function WorldMapControls({
  zoom,
  zoomMin,
  zoomMax,
  onZoomOut,
  onZoomIn,
  className,
  labelPercent,
  zoomAtMin,
  zoomAtMax,
  onRecenter,
  recenterLabel = "Enquadrar dados",
}: WorldMapControlsProps) {
  const atMin = zoomAtMin ?? zoom <= zoomMin + 0.001;
  const atMax = zoomAtMax ?? zoom >= zoomMax - 0.001;
  const display =
    labelPercent != null
      ? `${Math.round(labelPercent)}%`
      : `${Math.round(zoom * 100)}%`;

  return (
    <div
      className={cn(
        "pointer-events-auto z-20 flex shrink-0 items-center gap-0.5 rounded-2xl border border-white/[0.12] bg-zinc-950/80 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl backdrop-saturate-150",
        onRecenter && "pr-0.5",
        className,
      )}
      role="toolbar"
      aria-label="Zoom do mapa"
    >
      <button
        type="button"
        disabled={atMin}
        className={cn(
          "flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl text-sm font-semibold tabular-nums text-zinc-200 transition-all duration-200",
          atMin
            ? "cursor-not-allowed opacity-35"
            : "hover:bg-white/[0.1] hover:text-white active:scale-[0.96]",
        )}
        onClick={onZoomOut}
        aria-label="Afastar mapa"
      >
        −
      </button>
      <span className="min-w-[2.85rem] select-none px-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
        {display}
      </span>
      <button
        type="button"
        disabled={atMax}
        className={cn(
          "flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl text-sm font-semibold tabular-nums text-zinc-200 transition-all duration-200",
          atMax
            ? "cursor-not-allowed opacity-35"
            : "hover:bg-white/[0.1] hover:text-white active:scale-[0.96]",
        )}
        onClick={onZoomIn}
        aria-label="Aproximar mapa"
      >
        +
      </button>
      {onRecenter ? (
        <button
          type="button"
          onClick={onRecenter}
          className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-xl text-zinc-200 transition-all duration-200 hover:bg-white/[0.1] hover:text-white active:scale-[0.96]"
          aria-label={recenterLabel}
          title={recenterLabel}
        >
          <Crosshair className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
