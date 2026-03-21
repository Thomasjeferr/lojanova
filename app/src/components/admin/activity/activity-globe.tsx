"use client";

import createGlobe, { type Arc, type Marker } from "cobe";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { cn } from "@/lib/utils";

type ActivityGlobeProps = {
  points: ActivityMapPointDTO[];
  className?: string;
  minHeight?: number;
  /** Sem equivalente 3D; reservado para API alinhada ao mapa plano. */
  showHeatmap?: boolean;
  /** Arcos hub → pontos e rotação um pouco mais viva. */
  liveMode?: boolean;
};

function rgbForTypes(types: string[]): [number, number, number] {
  if (types.includes("purchase")) return [0.7, 0.55, 1];
  if (types.includes("login")) return [0.42, 0.72, 1];
  return [0.32, 0.9, 0.62];
}

function markerSize(count: number): number {
  return Math.min(0.1, 0.02 + Math.sqrt(Math.max(1, count)) * 0.01);
}

function hubLatLng(ps: ActivityMapPointDTO[]): [number, number] {
  if (ps.length === 0) return [15, 0];
  let w = 0;
  let lat = 0;
  let lng = 0;
  for (const p of ps) {
    const c = Math.max(1, p.count);
    w += c;
    lat += p.lat * c;
    lng += p.lng * c;
  }
  return [lat / w, lng / w];
}

function buildMarkers(points: ActivityMapPointDTO[]): Marker[] {
  return points.map((p, i) => ({
    location: [p.lat, p.lng] as [number, number],
    size: markerSize(p.count),
    color: rgbForTypes(p.types),
    id: `m-${p.lat}-${p.lng}-${i}`,
  }));
}

function buildArcs(
  points: ActivityMapPointDTO[],
  live: boolean,
): Arc[] {
  if (!live || points.length < 2) return [];
  const hub = hubLatLng(points);
  const sorted = [...points].sort((a, b) => b.count - a.count);
  const cap = Math.min(10, sorted.length);
  const arcs: Arc[] = [];
  for (let i = 0; i < cap; i++) {
    const p = sorted[i]!;
    if (Math.abs(p.lat - hub[0]) < 0.4 && Math.abs(p.lng - hub[1]) < 0.4)
      continue;
    arcs.push({
      from: hub,
      to: [p.lat, p.lng],
      color: rgbForTypes(p.types),
      id: `arc-${i}`,
    });
  }
  return arcs.slice(0, 8);
}

export function ActivityGlobe({
  points,
  className,
  minHeight = 420,
  showHeatmap: _showHeatmap = false,
  liveMode = true,
}: ActivityGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeInteractRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const rafRef = useRef<number>(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.28);
  const dragPhiRef = useRef(0);
  const dragThetaRef = useRef(0);
  const draggingRef = useRef(false);
  const lastPtrRef = useRef({ x: 0, y: 0 });
  const markersRef = useRef<Marker[]>([]);
  const arcsRef = useRef<Arc[]>([]);

  const [size, setSize] = useState({ w: 640, h: minHeight });
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(zoom);
  const [ready, setReady] = useState(false);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const el = globeInteractRef.current;
    if (!el || webglError) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY;
      setZoom((z) => {
        const next = z - dy * 0.0014;
        return Math.min(1.42, Math.max(0.72, next));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [webglError, ready]);

  const markers = useMemo(() => buildMarkers(points), [points]);
  const arcs = useMemo(
    () => buildArcs(points, liveMode),
    [points, liveMode],
  );

  useEffect(() => {
    markersRef.current = markers;
    arcsRef.current = arcs;
  }, [markers, arcs]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.max(280, Math.floor(r.width));
      setSize({
        w,
        h: Math.max(minHeight, Math.floor(r.width * 0.52)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [minHeight]);

  const zoomToScale = (z: number) => 0.82 + ((z - 0.72) / (1.42 - 0.72)) * 0.48;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w < 16 || size.h < 16) return;

    const probe = document.createElement("canvas");
    if (
      !probe.getContext("webgl2") &&
      !probe.getContext("webgl")
    ) {
      setWebglError(true);
      return;
    }

    const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size.w,
      height: size.h,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 22000,
      mapBrightness: 5.2,
      mapBaseBrightness: 0.12,
      baseColor: [0.18, 0.16, 0.22],
      markerColor: [0.75, 0.55, 1],
      glowColor: [0.45, 0.35, 0.85],
      markers: markersRef.current,
      arcs: arcsRef.current,
      arcColor: [0.55, 0.45, 0.95],
      arcWidth: 0.55,
      arcHeight: liveMode ? 0.32 : 0.22,
      markerElevation: 0.035,
      scale: zoomToScale(zoomRef.current),
      offset: [0, 0],
      opacity: 0.92,
    });

    globeRef.current = globe;
    setReady(true);
    setWebglError(false);

    const spin = liveMode ? 0.0042 : 0.0022;

    const tick = () => {
      const g = globeRef.current;
      if (!g) return;
      if (!draggingRef.current) {
        phiRef.current += spin;
      }
      g.update({
        phi: phiRef.current + dragPhiRef.current,
        theta: thetaRef.current + dragThetaRef.current,
        width: size.w,
        height: size.h,
        scale: zoomToScale(zoomRef.current),
        markers: markersRef.current,
        arcs: arcsRef.current,
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      globeRef.current = null;
      globe.destroy();
      setReady(false);
    };
  }, [size.w, size.h, liveMode]);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPtrRef.current.x;
    const dy = e.clientY - lastPtrRef.current.y;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    /* “Segurar o globo”: arrastar à direita/baixo move a superfície com o cursor (antes estava invertido). */
    dragThetaRef.current -= dx * 0.0055;
    dragPhiRef.current += dy * 0.0045;
    const max = 1.15;
    dragPhiRef.current = Math.max(-max, Math.min(max, dragPhiRef.current));
  };

  const endDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const mapInner = (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-[inherit]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(139,92,246,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(59,130,246,0.09),transparent_50%),radial-gradient(ellipse_50%_40%_at_0%_90%,rgba(16,185,129,0.06),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_28%,transparent_72%,rgba(0,0,0,0.22)_100%)]"
        aria-hidden
      />
      {liveMode ? (
        <div
          className="analytics-map-cf-aurora pointer-events-none absolute inset-0 mix-blend-screen"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 25% 15%, rgba(167,139,250,0.22), transparent 52%), radial-gradient(ellipse 80% 60% at 85% 75%, rgba(34,211,238,0.14), transparent 50%)",
          }}
        />
      ) : null}

      <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-xl border border-white/[0.12] bg-zinc-950/55 p-1 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xs font-semibold tabular-nums text-zinc-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white"
          onClick={() => setZoom((z) => Math.max(0.72, z - 0.12))}
          aria-label="Afastar globo"
        >
          −
        </button>
        <span className="min-w-[2.75rem] select-none px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xs font-semibold tabular-nums text-zinc-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white"
          onClick={() => setZoom((z) => Math.min(1.42, z + 0.12))}
          aria-label="Aproximar globo"
        >
          +
        </button>
      </div>

      {webglError ? (
        <div
          className="flex flex-col items-center justify-center gap-2 bg-zinc-950 text-sm text-zinc-500"
          style={{ height: size.h }}
        >
          <span className="text-xs text-zinc-400">
            WebGL indisponível neste dispositivo.
          </span>
        </div>
      ) : (
        <div
          ref={globeInteractRef}
          className="relative w-full cursor-grab active:cursor-grabbing"
          style={{ height: size.h }}
        >
          <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            className={cn(
              "block h-full w-full touch-none select-none opacity-0 transition-opacity duration-500",
              ready && "opacity-100",
            )}
            style={{ width: "100%", height: "100%" }}
            role="img"
            aria-label="Globo de atividade"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={(e) => {
              if (draggingRef.current) endDrag(e);
            }}
          />
          {!ready ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
              <span className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <span className="h-4 w-4 animate-pulse rounded-full bg-violet-500/40" />
              </span>
              <span className="relative z-[1] text-xs font-medium tracking-wide text-zinc-400">
                Carregando globo…
              </span>
            </div>
          ) : null}
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 sm:right-auto">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/[0.1] bg-zinc-950/60 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 shadow-lg backdrop-blur-xl">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-violet-500 opacity-40 blur-[3px]" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-300 to-violet-600 ring-2 ring-white/25 shadow-[0_0_10px_rgba(139,92,246,0.65)]" />
            </span>
            Compra
          </span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-40 blur-[3px]" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-300 to-blue-600 ring-2 ring-white/25 shadow-[0_0_10px_rgba(59,130,246,0.55)]" />
            </span>
            Login
          </span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-40 blur-[3px]" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 ring-2 ring-white/25 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </span>
            Acesso
          </span>
        </div>
        {ready ? (
          <p className="hidden text-[10px] text-zinc-600 sm:block">
            Arraste para girar · roda do mouse ou +/− para zoom
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800/55 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04]",
        className,
      )}
      style={{ minHeight }}
    >
      {mapInner}
    </div>
  );
}
