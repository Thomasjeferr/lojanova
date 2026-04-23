"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import type {
  GeoJSONSource,
  Map,
  MapLayerMouseEvent,
  Popup,
} from "maplibre-gl";
import type { ActivityMapPointDTO } from "@/lib/activity-admin";
import { getMaplibreStyleUrl } from "@/lib/maplibre-style";
import { cn } from "@/lib/utils";
import { WorldMapControls } from "./world-map-controls";
import { WorldMapLegend } from "./world-map-legend";

const SRC_CLUSTER = "activity-map-cluster";
const SRC_HEAT = "activity-map-heat";
const L_HM = "activity-heatmap";
const L_CL = "activity-clusters";
const L_PT = "activity-unclustered";

const MINZ = 1.4;
const MAXZ = 8.2;

function primaryType(
  types: string[],
): "purchase" | "login" | "access" {
  if (types.includes("purchase")) return "purchase";
  if (types.includes("login")) return "login";
  return "access";
}

function typeLabel(t: string) {
  if (t === "purchase") return "Compra";
  if (t === "login") return "Login";
  if (t === "access") return "Acesso";
  return t;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toClusterGeo(
  points: ActivityMapPointDTO[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat],
      },
      properties: {
        label: p.label,
        count: p.count,
        types: p.types,
        primaryType: primaryType(p.types),
      },
    })),
  };
}

function toHeatGeo(
  points: ActivityMapPointDTO[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat],
      },
      properties: { w: p.count },
    })),
  };
}

function parseTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  if (typeof raw === "string") {
    try {
      const j = JSON.parse(raw) as unknown;
      if (Array.isArray(j)) return j.map((x) => String(x));
    } catch {
      return ["access"];
    }
  }
  return ["access"];
}

export type ActivityMaplibreCoreProps = {
  points: ActivityMapPointDTO[];
  minHeight: number;
  className?: string;
  variant: "embedded" | "dark";
  showHeatmap?: boolean;
  showLegend?: boolean;
  fitBoundsKey?: string;
  lightBasemap?: boolean;
  /** Preenche a altura do pai (flex) — útil no dashboard com célula alta. */
  fillHeight?: boolean;
};

function toUiZoomPct(z: number) {
  return Math.min(200, Math.max(45, Math.round(32 * (z - 0.2))));
}

/**
 * Mapa de atividade (MapLibre): clusters, heatmap opcional, popups, enquadrar.
 */
export function ActivityMaplibreCore({
  points,
  minHeight,
  className,
  variant,
  showHeatmap = false,
  showLegend = true,
  fitBoundsKey,
  lightBasemap = false,
  fillHeight = false,
}: ActivityMaplibreCoreProps) {
  const uid = useId().replace(/:/g, "");
  const mapboxId = `mapbox-${uid}`;

  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const pointsRef = useRef(points);
  const showHeatmapRef = useRef(showHeatmap);
  const variantRef = useRef(variant);
  const fitKeyRef = useRef<string | undefined>(fitBoundsKey);
  const lastFitKeyDone = useRef<string | null>(null);
  const didAnyFit = useRef(false);
  const popupRef = useRef<Popup | null>(null);
  const fallbackTriedRef = useRef(false);
  const clickHandlerRef = useRef<((e: MapLayerMouseEvent) => void) | null>(null);
  const [rawZoom, setRawZoom] = useState(2.2);
  /** Quantos pontos existiam no onStyleLoad (0 = mapa pôde abrir vazio) */
  const atStyleLoadPointsRef = useRef(-1);

  pointsRef.current = points;
  showHeatmapRef.current = showHeatmap;
  variantRef.current = variant;
  fitKeyRef.current = fitBoundsKey;

  const [ready, setReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const applyData = useCallback(
    (map: Map) => {
      const c = toClusterGeo(pointsRef.current);
      const h = toHeatGeo(pointsRef.current);
      const a = map.getSource(SRC_CLUSTER) as GeoJSONSource | undefined;
      const b = map.getSource(SRC_HEAT) as GeoJSONSource | undefined;
      a?.setData(c);
      b?.setData(h);
      if (map.getLayer(L_HM)) {
        map.setLayoutProperty(
          L_HM,
          "visibility",
          showHeatmapRef.current ? "visible" : "none",
        );
      }
    },
    [],
  );

  const fitData = useCallback(
    (map: Map) => {
      const pts = pointsRef.current;
      if (pts.length === 0) {
        map.easeTo({ center: [-50, -14], zoom: 2, duration: 500 });
        return;
      }
      const lngs = pts.map((p) => p.lng);
      const lats = pts.map((p) => p.lat);
      const minX = Math.min(...lngs);
      const minY = Math.min(...lats);
      const maxX = Math.max(...lngs);
      const maxY = Math.max(...lats);
      if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return;
      if (maxX - minX < 0.2 || maxY - minY < 0.2) {
        map.easeTo({
          center: [(minX + maxX) / 2, (minY + maxY) / 2],
          zoom: 3.5,
          duration: 700,
        });
        return;
      }
      map.fitBounds(
        [
          [minX, minY],
          [maxX, maxY],
        ],
        {
          padding: { top: 52, bottom: 80, left: 36, right: 36 },
          maxZoom: 6.2,
          duration: 900,
          essential: true,
        },
      );
    },
    [],
  );

  const onResetView = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;
    lastFitKeyDone.current = null;
    fitData(m);
  }, [fitData]);

  const handleLayerClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = mapRef.current;
      if (!e.features?.length || !map) return;
      const f = e.features[0]!;
      if (!f.properties) return;
      if (f.properties["point_count"] != null) {
        const s = map.getSource(SRC_CLUSTER) as GeoJSONSource;
        const id = f.properties["cluster_id"] as number;
        void s
          .getClusterExpansionZoom(id)
          .then((z) => {
            const g = f.geometry;
            if (g.type === "Point" && g.coordinates) {
              const [ln, la] = g.coordinates;
              map.easeTo({
                center: [ln, la] as [number, number],
                zoom: z,
                duration: 480,
              });
            }
          })
          .catch(() => {});
        return;
      }
      if (f.geometry.type !== "Point" || !f.properties["count"]) return;
      const g = f.geometry as Point;
      const c = g.coordinates;
      if (!c) return;
      const label = String(f.properties["label"] ?? "—");
      const count = Math.max(1, Number(f.properties["count"]) | 0);
      const types = parseTypes(f.properties["types"]);
      const dark = variantRef.current === "dark";
      const bg = dark ? "rgba(15,15,20,0.95)" : "rgba(255,255,255,0.98)";
      const tc = dark ? "#fafafa" : "#18181b";
      const sc = dark ? "rgba(255,255,255,0.55)" : "rgba(24,24,27,0.55)";
      const html = `<div style="padding:10px 12px;max-width:220px;border-radius:12px;background:${bg};color:${tc};box-shadow:0 12px 32px rgba(0,0,0,0.2);">
        <p style="margin:0 0 6px;font-weight:600;font-size:13px;">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:12px;color:${sc};line-height:1.45;">${count} evento${count > 1 ? "s" : ""} · ${types
          .map(typeLabel)
          .join(", ")}</p>
      </div>`;
      void import("maplibre-gl").then((M) => {
        const ml = M;
        popupRef.current?.remove();
        popupRef.current = new ml.Popup({
          closeButton: true,
          maxWidth: "260px",
          offset: 6,
        })
          .setLngLat([c[0]!, c[1]!] as [number, number])
          .setHTML(html)
          .addTo(map);
      });
    },
    [],
  );

  const installClickHandlers = useCallback(
    (map: Map) => {
      if (clickHandlerRef.current) {
        map.off("click", L_CL, clickHandlerRef.current);
        map.off("click", L_PT, clickHandlerRef.current);
      }
      clickHandlerRef.current = handleLayerClick;
      map.on("click", L_CL, clickHandlerRef.current);
      map.on("click", L_PT, clickHandlerRef.current);
      map.on("mouseenter", L_CL, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", L_CL, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", L_PT, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", L_PT, () => {
        map.getCanvas().style.cursor = "";
      });
    },
    [handleLayerClick],
  );

  const addLayers = useCallback(
    (map: Map) => {
      if (map.getSource(SRC_HEAT)) return;
      const pts = pointsRef.current;
      const hm = showHeatmapRef.current;

      map.addSource(SRC_HEAT, {
        type: "geojson",
        data: toHeatGeo(pts),
      });

      map.addLayer({
        id: L_HM,
        type: "heatmap",
        source: SRC_HEAT,
        maxzoom: 12,
        layout: { visibility: hm ? "visible" : "none" },
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "w"],
            0,
            0,
            1,
            0.2,
            4,
            0.5,
            20,
            0.9,
            200,
            1,
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            2,
            4,
            20,
            6,
            32,
            8,
            50,
          ],
          "heatmap-opacity": 0.5,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.1,
            "rgba(99, 102, 241, 0.25)",
            0.35,
            "rgba(139, 92, 246, 0.5)",
            0.6,
            "rgba(34, 211, 238, 0.4)",
            1,
            "rgba(244, 63, 94, 0.32)",
          ],
        },
      });

      map.addSource(SRC_CLUSTER, {
        type: "geojson",
        data: toClusterGeo(pts),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 52,
      });

      map.addLayer({
        id: L_CL,
        type: "circle",
        source: SRC_CLUSTER,
        filter: ["has", "point_count"],
        paint: {
          "circle-stroke-color": "rgba(255,255,255,0.38)",
          "circle-stroke-width": 1.1,
          "circle-color": "rgba(99, 102, 241, 0.4)",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            5,
            25,
            20,
            32,
            100,
            40,
            300,
            50,
          ],
          "circle-opacity": 0.9,
        },
      });

      map.addLayer({
        id: L_PT,
        type: "circle",
        source: SRC_CLUSTER,
        filter: [
          "all",
          ["!", ["has", "point_count"]],
        ],
        paint: {
          "circle-color": [
            "match",
            ["get", "primaryType"],
            "purchase",
            "#7c3aed",
            "login",
            "#2563eb",
            "access",
            "#059669",
            "#64748b",
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            1,
            7,
            2,
            10,
            4,
            15,
            20,
            32,
          ],
          "circle-stroke-width": 1.1,
          "circle-stroke-color": "rgba(255,255,255,0.9)",
          "circle-opacity": 0.95,
        },
      });

      installClickHandlers(map);
    },
    [installClickHandlers],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setLoadError(null);
    let cancelled = false;
    const styleUrl = getMaplibreStyleUrl({ lightBasemap });
    (async () => {
      const ml = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !hostRef.current) return;
      const map = new ml.Map({
        container: hostRef.current,
        style: styleUrl,
        center: [-50, -14],
        minZoom: MINZ,
        maxZoom: MAXZ,
        zoom: 2.2,
        renderWorldCopies: false,
        scrollZoom: { around: "center" },
        attributionControl: { compact: true },
      });
      (map as unknown as { getContainer: () => HTMLElement })
        .getContainer()
        .setAttribute("data-activity-map", "1");
      (map as unknown as { getContainer: () => HTMLElement })
        .getContainer()
        .setAttribute("aria-label", "Mapa de atividade (MapLibre)");
      if (mapboxId) (map as unknown as { getContainer: () => HTMLElement })
        .getContainer()
        .id = mapboxId;

      mapRef.current = map;

      const onZoom = () => {
        const z = map.getZoom();
        setRawZoom(z);
        setZoomPercent(toUiZoomPct(z));
      };
      map.on("zoom", onZoom);
      map.on("zoomend", onZoom);

      const onError = (ev: { error?: { message: string } }) => {
        if (fallbackTriedRef.current) {
          setLoadError(ev.error?.message ?? "Erro ao carregar o mapa.");
          return;
        }
        fallbackTriedRef.current = true;
        setUsingFallback(true);
        map.setStyle(
          "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        );
        map.once("style.load", () => {
          if (cancelled) return;
          if (!map.getSource(SRC_HEAT)) {
            addLayers(map);
          }
          atStyleLoadPointsRef.current = pointsRef.current.length;
          applyData(map);
          onZoom();
          setReady(true);
          didAnyFit.current = true;
          if (fitKeyRef.current != null) {
            lastFitKeyDone.current = fitKeyRef.current;
          }
          fitData(map);
        });
      };

      const onStyleLoad = () => {
        if (cancelled) return;
        if (!map.isStyleLoaded()) return;
        if (!map.getSource(SRC_HEAT)) {
          addLayers(map);
        }
        atStyleLoadPointsRef.current = pointsRef.current.length;
        applyData(map);
        onZoom();
        if (!didAnyFit.current) {
          didAnyFit.current = true;
          const fk = fitKeyRef.current;
          if (fk !== undefined) {
            lastFitKeyDone.current = fk;
          }
          fitData(map);
        }
        setReady(true);
      };

      map.once("load", onStyleLoad);
      map.on("error", onError);
    })();
    return () => {
      cancelled = true;
      atStyleLoadPointsRef.current = -1;
      lastFitKeyDone.current = null;
      didAnyFit.current = false;
      fallbackTriedRef.current = false;
      setUsingFallback(false);
      popupRef.current?.remove();
      if (mapRef.current) {
        if (clickHandlerRef.current) {
          mapRef.current.off("click", L_CL, clickHandlerRef.current);
          mapRef.current.off("click", L_PT, clickHandlerRef.current);
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      setReady(false);
    };
    // Mapa: montagem única; dados/ajustes em outros efeitos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightBasemap]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !ready) return;
    if (!m.getSource(SRC_HEAT)) return;
    applyData(m);
    if (atStyleLoadPointsRef.current === 0 && points.length > 0) {
      atStyleLoadPointsRef.current = -1;
      fitData(m);
    }
  }, [points, showHeatmap, applyData, ready, fitData]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !ready) return;
    if (fitBoundsKey === undefined) return;
    if (lastFitKeyDone.current === fitBoundsKey) return;
    lastFitKeyDone.current = fitBoundsKey;
    fitData(m);
  }, [fitBoundsKey, fitData, ready, points.length]);

  useEffect(() => {
    const m = mapRef.current;
    const el = hostRef.current;
    if (!m || !el || !ready) return;
    const ro = new ResizeObserver(() => {
      m.resize();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [ready]);

  const nudgeZoom = (delta: number) => {
    const m = mapRef.current;
    if (!m) return;
    const z = m.getZoom();
    m.easeTo({
      zoom: Math.min(MAXZ, Math.max(MINZ, z + delta)),
      duration: 220,
    });
  };

  return (
    <div
      className={cn(
        "relative w-full",
        fillHeight && "flex min-h-0 flex-1 flex-col",
        className,
      )}
    >
      <div
        ref={hostRef}
        className={cn(
          "activity-maplibre-canvas w-full min-w-0 touch-none",
          fillHeight && "min-h-0 flex-1",
        )}
        style={
          fillHeight
            ? { minHeight, height: "100%" }
            : { minHeight, height: minHeight }
        }
        id={mapboxId}
        role="region"
        aria-label="Mapa de eventos (interativo)"
      />
      {loadError ? (
        <div
          className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 bg-zinc-950/90 px-4 text-center text-xs text-zinc-300"
          role="alert"
        >
          <p className="max-w-sm text-zinc-200">{loadError}</p>
          <button
            type="button"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
            onClick={() => {
              setLoadError(null);
              if (mapRef.current) onResetView();
            }}
          >
            Tentar enquadrar
          </button>
        </div>
      ) : null}
      {usingFallback && !loadError ? (
        <p className="pointer-events-none absolute right-2 top-2 z-[1] max-w-[11rem] rounded-md bg-amber-500/15 px-2 py-1 text-[9px] font-medium text-amber-100/90 ring-1 ring-amber-400/25">
          Mapa de reserva (Carto) — ajusta a chave em <code>MAP*STYLE</code>
        </p>
      ) : null}

      <div
        className={cn(
          "absolute right-0 top-0 z-[2] p-2 sm:p-3",
        )}
      >
        <div className="flex flex-col items-stretch gap-1.5">
          <WorldMapControls
            zoom={zoomPercent / 100}
            zoomMin={MINZ / 8.2}
            zoomMax={MAXZ / 8.2}
            onZoomIn={() => nudgeZoom(0.35)}
            onZoomOut={() => nudgeZoom(-0.35)}
            labelPercent={zoomPercent}
            zoomAtMin={rawZoom <= MINZ + 0.04}
            zoomAtMax={rawZoom >= MAXZ - 0.04}
            onRecenter={onResetView}
            recenterLabel="Enquadrar eventos"
          />
        </div>
      </div>
      {showLegend ? (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[1] p-2 sm:p-3",
            variant === "dark" && "pt-0",
          )}
        >
          <WorldMapLegend embedded={variant === "embedded"} />
        </div>
      ) : null}

      <style>{`
        .maplibregl-map { font: inherit; }
        .maplibregl-ctrl.maplibregl-ctrl-group {
          display: none;
        }
        .activity-maplibre-canvas .maplibregl-canvas { outline: none; }
        .maplibregl-popup-content { border-radius: 10px; padding: 0; }
      `}</style>
    </div>
  );
}
