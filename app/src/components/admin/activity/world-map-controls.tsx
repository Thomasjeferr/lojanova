"use client";

import { cn } from "@/lib/utils";

type WorldMapControlsProps = {
  zoom: number;
  zoomMin: number;
  zoomMax: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  className?: string;
};

export function WorldMapControls({
  zoom,
  zoomMin,
  zoomMax,
  onZoomOut,
  onZoomIn,
  className,
}: WorldMapControlsProps) {
  const atMin = zoom <= zoomMin + 0.001;
  const atMax = zoom >= zoomMax - 0.001;

  return (
    <div
      className={cn(
        "pointer-events-auto z-20 flex shrink-0 items-center gap-0.5 rounded-2xl border border-white/[0.12] bg-zinc-950/80 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl backdrop-saturate-150",
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
        {Math.round(zoom * 100)}%
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
    </div>
  );
}
