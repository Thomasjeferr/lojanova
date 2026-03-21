"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { HeatMapLayer } from "@/components/admin/analytics/heat-map-layer";
import { cn } from "@/lib/utils";

const WORLD_JSON =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function markerGradientId(types: string[]): string {
  if (types.includes("purchase")) return "activityMarkerPurchase";
  if (types.includes("login")) return "activityMarkerLogin";
  return "activityMarkerAccess";
}

type ActivityWorldMapProps = {
  points: ActivityMapPointDTO[];
  className?: string;
  /** Altura mínima do mapa */
  minHeight?: number;
  /**
   * Quando true, moldura clara alinhada aos cards da dashboard (mapa escuro no interior).
   */
  embedded?: boolean;
  /** Camada de calor sob os pontos (analytics). */
  showHeatmap?: boolean;
  /** Raios, pulsos e feixes (dashboard analytics). */
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
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.max(280, Math.floor(r.width));
      setSize({
        w,
        h: Math.max(minHeight, Math.floor(r.width * 0.48)),
      });
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

  const mapInner = (
    <div
      ref={wrapRef}
      className={cn(
        "relative overflow-hidden",
        embedded ? "rounded-[14px]" : "rounded-[inherit]",
      )}
      style={embedded ? { minHeight } : undefined}
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
              "radial-gradient(ellipse 90% 70% at 25% 15%, rgba(167,139,250,0.35), transparent 52%), radial-gradient(ellipse 80% 60% at 85% 75%, rgba(34,211,238,0.2), transparent 50%), radial-gradient(ellipse 50% 40% at 60% 40%, rgba(244,114,182,0.08), transparent 45%)",
          }}
        />
      ) : null}

      <div className="absolute right-3 top-3 z-10 flex items-center gap-0.5 rounded-xl border border-white/[0.12] bg-zinc-950/55 p-1 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xs font-semibold tabular-nums text-zinc-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white"
          onClick={() => setZoom((z) => Math.max(0.72, z - 0.12))}
          aria-label="Afastar mapa"
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
          aria-label="Aproximar mapa"
        >
          +
        </button>
      </div>

      {!topology ? (
        <div
          className="activity-map-loading-track flex flex-col items-center justify-center gap-3 bg-zinc-950 text-sm text-zinc-500"
          style={{ height: size.h }}
        >
          <span className="relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <span className="h-4 w-4 animate-pulse rounded-full bg-violet-500/40" />
          </span>
          <span className="relative z-[1] text-xs font-medium tracking-wide text-zinc-400">
            Carregando mapa…
          </span>
        </div>
      ) : (
        <svg
          width="100%"
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="block touch-none select-none"
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
          <g
            className="activity-map-zoom-layer"
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `translate(${cx}px, ${cy}px) scale(${zoom}) translate(${-cx}px, ${-cy}px)`,
            }}
          >
            <rect width={size.w} height={size.h} fill="url(#activityOcean)" />
            {landPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="url(#activityLand)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.45}
                className="activity-map-land hover:brightness-[1.08]"
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
                    animationDelay: liveMode ? `${Math.min(i, 40) * 55}ms` : undefined,
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

      {hover ? (
        <div
          className={cn(
            "pointer-events-none absolute z-20 max-w-[240px] rounded-xl px-3.5 py-2.5 text-xs shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md transition-opacity duration-200",
            embedded
              ? "border border-zinc-200/90 bg-white/[0.97] text-zinc-800 ring-1 ring-zinc-950/[0.04]"
              : "border border-white/[0.14] bg-zinc-950/[0.94] text-zinc-100 ring-1 ring-white/[0.06]",
          )}
          style={{
            left: Math.min(size.w - 248, Math.max(10, hover.x - 110)),
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

      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 sm:right-auto">
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-lg backdrop-blur-xl",
            embedded
              ? "border-zinc-200/80 bg-white/[0.88] text-zinc-600 ring-1 ring-zinc-950/[0.03]"
              : "border-white/[0.1] bg-zinc-950/60 text-zinc-400",
          )}
        >
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
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        embedded
          ? "rounded-2xl border border-zinc-200/90 bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_50px_-22px_rgba(0,0,0,0.1)] ring-1 ring-zinc-950/[0.025]"
          : "relative overflow-hidden rounded-2xl border border-zinc-800/55 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04]",
        className,
      )}
      style={{ minHeight: embedded ? undefined : minHeight }}
    >
      {embedded ? (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100/90 px-3 pb-2.5 pt-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600/85">
                Geografia
              </p>
              <p className="text-sm font-semibold tracking-tight text-zinc-800">
                Mapa de eventos
              </p>
            </div>
          </div>
          {mapInner}
        </>
      ) : (
        mapInner
      )}
    </div>
  );
}
