"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { HeatMapLayer } from "@/components/admin/analytics/heat-map-layer";
import { cn } from "@/lib/utils";
import { WorldMapControls } from "./world-map-controls";
import { WorldMapLegend } from "./world-map-legend";
import { WorldMapEmbeddedHeader } from "./world-map-embedded-header";

const WORLD_JSON =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.85;
const ZOOM_STEP_BUTTON = 0.12;
const ZOOM_STEP_WHEEL = 0.09;

/** Altura do mapa em função da largura útil — mais alto em mobile, mais “cinemático” em desktop */
function computeMapDimensions(
  containerWidth: number,
  minH: number,
): { w: number; h: number } {
  const w = Math.max(260, Math.round(containerWidth));
  const rw = containerWidth;
  let ratio = 0.5;
  if (rw < 360) ratio = 0.64;
  else if (rw < 480) ratio = 0.58;
  else if (rw < 640) ratio = 0.54;
  else if (rw < 900) ratio = 0.5;
  else if (rw < 1200) ratio = 0.47;
  else ratio = 0.44;
  let h = Math.round(w * ratio);
  h = Math.max(minH, h);
  h = Math.min(520, h);
  return { w, h };
}

function clampPanToZoom(
  px: number,
  py: number,
  z: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const cx = w / 2;
  const cy = h / 2;
  const pad = 56;
  if (z <= 1) {
    const limX = cx * (1 - z) + pad;
    const limY = cy * (1 - z) + pad;
    return {
      x: Math.max(-limX, Math.min(limX, px)),
      y: Math.max(-limY, Math.min(limY, py)),
    };
  }
  const limX = cx * (z - 1) + pad;
  const limY = cy * (z - 1) + pad;
  return {
    x: Math.max(-limX, Math.min(limX, px)),
    y: Math.max(-limY, Math.min(limY, py)),
  };
}

function markerGradientId(types: string[]): string {
  if (types.includes("purchase")) return "activityMarkerPurchase";
  if (types.includes("login")) return "activityMarkerLogin";
  return "activityMarkerAccess";
}

type ActivityWorldMapProps = {
  points: ActivityMapPointDTO[];
  className?: string;
  minHeight?: number;
  embedded?: boolean;
  showHeatmap?: boolean;
  liveMode?: boolean;
};

export function ActivityWorldMap({
  points,
  className,
  minHeight = 420,
  embedded = false,
  showHeatmap = false,
  liveMode = false,
}: ActivityWorldMapProps) {
  const heatGradientId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<Topology | null>(null);
  const [size, setSize] = useState({ w: 960, h: minHeight });
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    label: string;
    count: number;
    types: string[];
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, lastClientX: 0, lastClientY: 0 });

  const clampPan = useCallback(
    (px: number, py: number) => clampPanToZoom(px, py, zoom, size.w, size.h),
    [zoom, size.w, size.h],
  );

  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y));
  }, [zoom, size.w, size.h, clampPan]);

  useEffect(() => {
    if (!topology) return;
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      const step =
        Math.abs(e.deltaY) >= 100 ? ZOOM_STEP_WHEEL * 1.35 : ZOOM_STEP_WHEEL;
      setZoom((z) => {
        const next = z + dir * step;
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [topology]);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_JSON)
      .then((r) => r.json())
      .then((t: Topology) => {
        if (!cancelled) setTopology(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr?.width) return;
      const next = computeMapDimensions(cr.width, minHeight);
      setSize((prev) =>
        prev.w === next.w && prev.h === next.h ? prev : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [minHeight]);

  const geojson = useMemo(() => {
    if (!topology?.objects?.countries) return null;
    return feature(topology, topology.objects.countries) as FeatureCollection;
  }, [topology]);

  const { landPaths, projected } = useMemo(() => {
    if (!geojson) {
      return {
        landPaths: [] as string[],
        projected: [] as Array<ActivityMapPointDTO & { x: number; y: number }>,
      };
    }
    const projection = geoNaturalEarth1();
    const path = geoPath().projection(projection);
    projection.fitSize([size.w, size.h], geojson);
    const landPaths = geojson.features
      .map((f) => path(f))
      .filter((d): d is string => Boolean(d));

    const projected = points
      .map((p) => {
        const c = projection([p.lng, p.lat]);
        if (!c) return null;
        return { ...p, x: c[0], y: c[1] };
      })
      .filter(
        (p): p is ActivityMapPointDTO & { x: number; y: number } =>
          p !== null,
      );

    return { landPaths, projected };
  }, [geojson, size, points]);

  const typeLabel = (t: string) =>
    t === "purchase"
      ? "Compra"
      : t === "login"
        ? "Login"
        : t === "access"
          ? "Acesso"
          : t;

  const cx = size.w / 2;
  const cy = size.h / 2;

  const clientToSvgDelta = useCallback(
    (clientX: number, clientY: number, fromX: number, fromY: number) => {
      const svg = svgRef.current;
      const ctm = svg?.getScreenCTM();
      if (!ctm) {
        return { x: clientX - fromX, y: clientY - fromY };
      }
      const inv = ctm.inverse();
      const a = new DOMPoint(clientX, clientY).matrixTransform(inv);
      const b = new DOMPoint(fromX, fromY).matrixTransform(inv);
      return { x: a.x - b.x, y: a.y - b.y };
    },
    [],
  );

  const onPanPointerDown = (e: ReactPointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
    };
    setIsDragging(true);
  };

  const onPanPointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragRef.current.active) return;
    const { lastClientX, lastClientY } = dragRef.current;
    const d = clientToSvgDelta(e.clientX, e.clientY, lastClientX, lastClientY);
    dragRef.current.lastClientX = e.clientX;
    dragRef.current.lastClientY = e.clientY;
    setPan((p) => clampPan(p.x + d.x, p.y + d.y));
  };

  const endPan = (e: ReactPointerEvent<SVGRectElement>) => {
    if (dragRef.current.active) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const mapTransform = `translate(${pan.x},${pan.y}) translate(${cx},${cy}) scale(${zoom}) translate(${-cx},${-cy})`;

  const mapViewportHeight = topology ? size.h : Math.max(minHeight, 220);

  const mapInner = (
    <div
      ref={wrapRef}
      className={cn(
        "relative isolate w-full min-w-0 overflow-hidden bg-[#050508]",
        embedded ? "rounded-b-2xl" : "rounded-[inherit]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_85%_at_50%_-5%,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_65%_45%_at_100%_100%,rgba(59,130,246,0.08),transparent_48%),radial-gradient(ellipse_45%_38%_at_0%_95%,rgba(16,185,129,0.05),transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_30%,transparent_68%,rgba(0,0,0,0.25)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.05]"
        aria-hidden
      />

      {liveMode ? (
        <div
          className="analytics-map-cf-aurora pointer-events-none absolute inset-0 mix-blend-screen"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 25% 15%, rgba(167,139,250,0.28), transparent 52%), radial-gradient(ellipse 80% 60% at 85% 75%, rgba(34,211,238,0.16), transparent 50%)",
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-2 sm:p-3">
        <WorldMapControls
          zoom={zoom}
          zoomMin={ZOOM_MIN}
          zoomMax={ZOOM_MAX}
          onZoomOut={() =>
            setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP_BUTTON))
          }
          onZoomIn={() =>
            setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP_BUTTON))
          }
          className="pointer-events-auto shadow-black/40"
        />
      </div>

      <div
        className="relative w-full min-w-0 transition-[min-height] duration-300 ease-out"
        style={{ height: mapViewportHeight }}
      >
        {!topology ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 bg-zinc-950 text-sm text-zinc-500">
            <span className="relative z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-inner">
              <span className="h-4 w-4 animate-pulse rounded-full bg-violet-500/50" />
            </span>
            <span className="relative z-[1] text-xs font-medium tracking-wide text-zinc-400">
              Carregando mapa…
            </span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${size.w} ${size.h}`}
            preserveAspectRatio="xMidYMid meet"
            className="block h-full w-full max-w-full touch-none select-none"
            style={{ touchAction: "none" }}
            role="img"
            aria-label="Mapa mundial de atividade"
          >
            <defs>
              <linearGradient
                id="activityOcean"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0f0f12" />
                <stop offset="45%" stopColor="#0a0a0d" />
                <stop offset="100%" stopColor="#060608" />
              </linearGradient>
              <linearGradient id="activityLand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#35353b" />
                <stop offset="100%" stopColor="#26262c" />
              </linearGradient>
              <radialGradient
                id="activityMarkerPurchase"
                cx="32%"
                cy="32%"
                r="75%"
              >
                <stop offset="0%" stopColor="#f5e9ff" stopOpacity={0.95} />
                <stop offset="35%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#5b21b6" />
              </radialGradient>
              <radialGradient id="activityMarkerLogin" cx="32%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#e8f1ff" stopOpacity={0.95} />
                <stop offset="35%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </radialGradient>
              <radialGradient
                id="activityMarkerAccess"
                cx="32%"
                cy="32%"
                r="75%"
              >
                <stop offset="0%" stopColor="#ecfdf5" stopOpacity={0.92} />
                <stop offset="38%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
              <filter
                id="activityMarkerShadow"
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
              >
                <feDropShadow
                  dx="0"
                  dy="1.5"
                  stdDeviation="1.8"
                  floodColor="#000"
                  floodOpacity={0.45}
                />
              </filter>
            </defs>
            <g transform={mapTransform}>
              <rect width={size.w} height={size.h} fill="url(#activityOcean)" />
              {landPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="url(#activityLand)"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={0.45}
                  className="activity-map-land hover:brightness-[1.08]"
                  pointerEvents="none"
                />
              ))}
              {liveMode && projected.length > 0 ? (
                <g pointerEvents="none" className="analytics-map-beams">
                  {projected.map((p, i) => (
                    <line
                      key={`beam-${p.lat}-${p.lng}-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={p.x}
                      y2={p.y}
                      stroke="rgba(167, 139, 250, 0.2)"
                      strokeWidth={Math.min(
                        1.35,
                        0.35 + Math.sqrt(p.count) * 0.14,
                      )}
                      strokeDasharray="2 9"
                      className="analytics-map-beam-line"
                      style={{ animationDelay: `${(i % 24) * 60}ms` }}
                    />
                  ))}
                </g>
              ) : null}
              {showHeatmap ? (
                <HeatMapLayer projected={projected} gradientId={heatGradientId} />
              ) : null}
              <rect
                width={size.w}
                height={size.h}
                fill="transparent"
                className={cn(isDragging ? "cursor-grabbing" : "cursor-grab")}
                style={{ touchAction: "none" }}
                aria-hidden
                onPointerDown={onPanPointerDown}
                onPointerMove={onPanPointerMove}
                onPointerUp={endPan}
                onPointerCancel={endPan}
              />
              {projected.map((p, i) => {
                const gid = markerGradientId(p.types);
                const r = Math.min(13, 4.2 + Math.sqrt(p.count) * 1.65);
                const pulseStroke =
                  gid === "activityMarkerPurchase"
                    ? "rgba(196, 181, 253, 0.7)"
                    : gid === "activityMarkerLogin"
                      ? "rgba(147, 197, 253, 0.65)"
                      : "rgba(110, 231, 183, 0.6)";
                const pulseDur = `${2.1 + (i % 8) * 0.11}s`;
                return (
                  <g
                    key={`${p.lat}-${p.lng}-${i}`}
                    onMouseEnter={(e) => {
                      const rect = wrapRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setHover({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        label: p.label,
                        count: p.count,
                        types: p.types,
                      });
                    }}
                    onMouseLeave={() => setHover(null)}
                    className={cn(
                      "cursor-pointer",
                      liveMode && "analytics-map-marker-node",
                    )}
                    style={{
                      transition: "opacity 0.25s ease",
                      animationDelay: liveMode
                        ? `${Math.min(i, 40) * 55}ms`
                        : undefined,
                    }}
                  >
                    {liveMode ? (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill="none"
                        stroke={pulseStroke}
                        strokeWidth={1.15}
                        pointerEvents="none"
                      >
                        <animate
                          attributeName="r"
                          values={`${r};${r + 24};${r}`}
                          dur={pulseDur}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur={pulseDur}
                          repeatCount="indefinite"
                        />
                      </circle>
                    ) : null}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + 11}
                      fill="currentColor"
                      className="activity-map-halo"
                      style={{
                        color:
                          gid === "activityMarkerPurchase"
                            ? "rgba(147, 51, 234, 0.35)"
                            : gid === "activityMarkerLogin"
                              ? "rgba(59, 130, 246, 0.32)"
                              : "rgba(16, 185, 129, 0.32)",
                      }}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + 5}
                      fill="currentColor"
                      className="activity-map-halo activity-map-halo--delayed"
                      style={{
                        color:
                          gid === "activityMarkerPurchase"
                            ? "rgba(167, 139, 250, 0.22)"
                            : gid === "activityMarkerLogin"
                              ? "rgba(96, 165, 250, 0.2)"
                              : "rgba(52, 211, 153, 0.2)",
                      }}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill={`url(#${gid})`}
                      stroke="rgba(255,255,255,0.88)"
                      strokeWidth={1.15}
                      filter="url(#activityMarkerShadow)"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={Math.max(1.5, r * 0.28)}
                      fill="rgba(255,255,255,0.35)"
                      pointerEvents="none"
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {hover ? (
        <div
          className={cn(
            "pointer-events-none absolute z-30 max-w-[min(240px,calc(100%-1.5rem))] rounded-xl px-3.5 py-2.5 text-xs shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md transition-opacity duration-200",
            embedded
              ? "border border-zinc-200/90 bg-white/[0.97] text-zinc-800 ring-1 ring-zinc-950/[0.04]"
              : "border border-white/[0.14] bg-zinc-950/[0.94] text-zinc-100 ring-1 ring-white/[0.06]",
          )}
          style={{
            left: Math.min(
              Math.max(10, hover.x - 110),
              (wrapRef.current?.clientWidth ?? size.w) - 230,
            ),
            top: Math.max(10, hover.y - 58),
          }}
        >
          <p
            className={cn(
              "font-semibold leading-snug",
              embedded ? "text-zinc-900" : "text-white",
            )}
          >
            {hover.label}
          </p>
          <p
            className={cn(
              "mt-1 leading-relaxed",
              embedded ? "text-zinc-500" : "text-zinc-400",
            )}
          >
            {hover.count} evento{hover.count > 1 ? "s" : ""} ·{" "}
            {hover.types.map(typeLabel).join(", ")}
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-2 sm:p-3">
        <WorldMapLegend embedded={embedded} />
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200/85 bg-white",
          "shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_20px_56px_-28px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.03)]",
          "ring-1 ring-zinc-950/[0.035] transition-shadow duration-300",
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_26px_64px_-28px_rgba(15,23,42,0.16)]",
          className,
        )}
      >
        <WorldMapEmbeddedHeader />
        {mapInner}
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
      {mapInner}
    </div>
  );
}
