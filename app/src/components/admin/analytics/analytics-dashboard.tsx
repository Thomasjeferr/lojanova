"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Map } from "lucide-react";
import type { AnalyticsPageSeed } from "@/lib/activity-analytics";
import type { ActivityMapPointDTO, ActivityRecentDTO } from "@/lib/activity-admin";
import type { AnalyticsStatsPayloadDTO } from "@/lib/activity-analytics";
import {
  analyticsQueryToSearchParams,
  parseAnalyticsQueryParams,
  type AnalyticsQuery,
} from "@/lib/analytics-params";
import { ANALYTICS_REALTIME_POLL_MS } from "@/lib/analytics-realtime";
import { WorldMapAdvanced } from "./world-map-advanced";
import { KPIGrid } from "./kpi-grid";
import { ActivityFeed } from "./activity-feed";
import { ChartsSection } from "./charts-section";
import { cn } from "@/lib/utils";
import { toAdminPath } from "@/lib/admin-path";

async function readJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function AnalyticsFilters({
  query,
  filterCountries,
  onChange,
}: {
  query: AnalyticsQuery;
  filterCountries: AnalyticsStatsPayloadDTO["filterCountries"];
  onChange: (next: AnalyticsQuery) => void;
}) {
  return (
    <div className="group/filters flex flex-col gap-3 rounded-2xl border border-white/[0.11] bg-zinc-950/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_70px_-30px_rgba(0,0,0,0.78),0_0_40px_-12px_rgba(139,92,246,0.06)] backdrop-blur-xl transition duration-300 hover:border-violet-400/28 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_32px_80px_-28px_rgba(139,92,246,0.12)] sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-xs font-semibold text-zinc-400 transition group-hover/filters:text-zinc-300">
        Período
        <select
          value={query.range}
          onChange={(e) =>
            onChange({
              ...query,
              range: e.target.value as AnalyticsQuery["range"],
            })
          }
          className="rounded-xl border border-white/12 bg-zinc-900/90 px-3 py-2.5 text-sm font-medium text-white outline-none ring-violet-500/20 transition hover:border-violet-400/30 hover:bg-zinc-900 focus:ring-2 focus:ring-violet-500/40"
        >
          <option value="today">Hoje (Brasília)</option>
          <option value="24h">Últimas 24 horas</option>
          <option value="7d">Últimos 7 dias</option>
        </select>
      </label>
      <label className="flex min-w-[160px] flex-1 flex-col gap-1.5 text-xs font-semibold text-zinc-400 transition group-hover/filters:text-zinc-300">
        Tipo de evento
        <select
          value={query.type}
          onChange={(e) =>
            onChange({
              ...query,
              type: e.target.value as AnalyticsQuery["type"],
            })
          }
          className="rounded-xl border border-white/12 bg-zinc-900/90 px-3 py-2.5 text-sm font-medium text-white outline-none ring-violet-500/20 transition hover:border-violet-400/30 hover:bg-zinc-900 focus:ring-2 focus:ring-violet-500/40"
        >
          <option value="all">Todos</option>
          <option value="login">Login</option>
          <option value="access">Acesso</option>
          <option value="purchase">Compra</option>
        </select>
      </label>
      <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 text-xs font-semibold text-zinc-400 transition group-hover/filters:text-zinc-300">
        País
        <select
          value={query.countryCode ?? ""}
          onChange={(e) =>
            onChange({
              ...query,
              countryCode: e.target.value ? e.target.value : null,
            })
          }
          className="rounded-xl border border-white/12 bg-zinc-900/90 px-3 py-2.5 text-sm font-medium text-white outline-none ring-violet-500/20 transition hover:border-violet-400/30 hover:bg-zinc-900 focus:ring-2 focus:ring-violet-500/40"
        >
          <option value="">Todos os países</option>
          {filterCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function AnalyticsDashboard({
  seed,
  showBackLink = false,
  mapMinHeight = 460,
}: {
  seed: AnalyticsPageSeed;
  showBackLink?: boolean;
  mapMinHeight?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQueryState] = useState<AnalyticsQuery>(() => seed.query);
  const [points, setPoints] = useState<ActivityMapPointDTO[]>(seed.points);
  const [events, setEvents] = useState<ActivityRecentDTO[]>(seed.events);
  const [stats, setStats] = useState<AnalyticsStatsPayloadDTO>(seed.stats);
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [livePulseTick, setLivePulseTick] = useState(0);
  const prevEventHeadRef = useRef<string | undefined>(undefined);

  const displayEvents = events.length > 0 ? events : seed.demoActivityFeed;
  const feedSimulated = events.length === 0;

  useEffect(() => {
    const head = displayEvents[0]?.id;
    if (
      head &&
      prevEventHeadRef.current !== undefined &&
      head !== prevEventHeadRef.current
    ) {
      setLivePulseTick((n) => n + 1);
    }
    if (head) prevEventHeadRef.current = head;
  }, [displayEvents]);

  useEffect(() => {
    const parsed = parseAnalyticsQueryParams(searchParams);
    setQueryState((prev) =>
      prev.range === parsed.range &&
      prev.type === parsed.type &&
      prev.countryCode === parsed.countryCode
        ? prev
        : parsed,
    );
  }, [searchParams]);

  const setQuery = useCallback(
    (next: AnalyticsQuery) => {
      setQueryState(next);
      const qs = analyticsQueryToSearchParams(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const refreshRealtimeOnly = useCallback(async (q: AnalyticsQuery) => {
    setFeedLoading(true);
    const qs = analyticsQueryToSearchParams(q);
    try {
      const liveRes = await fetch(
        `/api/admin/analytics/realtime?${qs}&limit=20`,
        { credentials: "same-origin" },
      );
      const liveData = await readJson<{ events?: ActivityRecentDTO[] }>(
        liveRes,
      );
      if (liveRes.ok && Array.isArray(liveData?.events))
        setEvents(liveData.events);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const refreshBundle = useCallback(async (q: AnalyticsQuery) => {
    setLoading(true);
    const qs = analyticsQueryToSearchParams(q);
    try {
      const [mapRes, statsRes, liveRes] = await Promise.all([
        fetch(`/api/admin/analytics/map?${qs}`, { credentials: "same-origin" }),
        fetch(`/api/admin/analytics/stats?${qs}`, { credentials: "same-origin" }),
        fetch(`/api/admin/analytics/realtime?${qs}&limit=20`, {
          credentials: "same-origin",
        }),
      ]);
      const [mapData, statsData, liveData] = await Promise.all([
        readJson<{ points?: ActivityMapPointDTO[] }>(mapRes),
        readJson<AnalyticsStatsPayloadDTO>(statsRes),
        readJson<{ events?: ActivityRecentDTO[] }>(liveRes),
      ]);
      if (mapRes.ok && mapData?.points) setPoints(mapData.points);
      if (statsRes.ok && statsData?.kpis && statsData?.charts)
        setStats(statsData);
      if (liveRes.ok && Array.isArray(liveData?.events))
        setEvents(liveData.events);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBundle(query);
  }, [query, refreshBundle]);

  useEffect(() => {
    const id = setInterval(() => {
      void refreshRealtimeOnly(query);
    }, ANALYTICS_REALTIME_POLL_MS);
    return () => clearInterval(id);
  }, [query, refreshRealtimeOnly]);

  return (
    <div className="analytics-cf-root relative space-y-6 lg:space-y-8">
      <div
        className="analytics-cf-grid-bg pointer-events-none fixed inset-0 -z-10 opacity-[0.65]"
        aria-hidden
      />
      <div
        className="analytics-cf-vignette pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.18),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(34,211,238,0.09),transparent),radial-gradient(ellipse_50%_35%_at_0%_80%,rgba(167,139,250,0.1),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {showBackLink ? (
        <Link
          href={toAdminPath()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 transition hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/40 p-6 shadow-[0_48px_140px_-42px_rgba(0,0,0,0.9),0_0_100px_-24px_rgba(139,92,246,0.28),0_0_60px_-12px_rgba(34,211,238,0.1)] ring-1 ring-inset ring-white/[0.08] sm:p-8">
        <div className="analytics-cf-hero-sheen" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-600/28 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/18 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.04)_50%,transparent_60%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              Analytics
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200/95 shadow-[0_0_24px_-6px_rgba(52,211,153,0.45)] ring-1 ring-emerald-400/20">
              <span
                className="analytics-cf-live-dot relative flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                aria-hidden
              />
              Live
            </span>
          </div>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-3xl">
            <Map className="h-8 w-8 text-violet-400 drop-shadow-[0_0_16px_rgba(167,139,250,0.55)]" />
            Centro de atividade
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Mapa, heatmap, feed ao vivo e funis — atualização contínua com
            infraestrutura pronta para WebSocket (polling curto por agora).
          </p>
        </div>
      </div>

      <AnalyticsFilters
        query={query}
        filterCountries={stats.filterCountries}
        onChange={setQuery}
      />

      {stats.suspicious.flagged ? (
        <div
          className={cn(
            "flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/[0.1] px-4 py-3 text-sm text-amber-100",
            "shadow-[0_0_48px_-10px_rgba(245,158,11,0.4)] backdrop-blur-xl transition hover:border-amber-400/50",
          )}
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-amber-50">
              Atividade incomum detectada
            </p>
            <p className="mt-1 text-amber-100/85">{stats.suspicious.message}</p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "relative transition-opacity duration-300",
          loading && "pointer-events-none opacity-60",
        )}
      >
        <KPIGrid kpis={stats.kpis} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:gap-8 xl:gap-10">
        <div className="relative xl:col-span-3">
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[1.35rem] bg-gradient-to-b from-violet-500/8 via-transparent to-cyan-500/6 blur-xl" />
          <WorldMapAdvanced
            points={points}
            minHeight={mapMinHeight}
            fitBoundsKey={`${query.range}-${query.type}-${query.countryCode ?? "all"}`}
          />
        </div>
        <div className="xl:col-span-2">
          <ActivityFeed
            events={displayEvents}
            simulated={feedSimulated}
            loading={feedLoading}
            pollMs={ANALYTICS_REALTIME_POLL_MS}
            livePulseTick={livePulseTick}
            onManualRefresh={() => void refreshRealtimeOnly(query)}
          />
        </div>
      </div>

      <ChartsSection charts={stats.charts} />
    </div>
  );
}
