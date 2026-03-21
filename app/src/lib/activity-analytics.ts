import type { ActivityEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  BR_TIMEZONE,
  formatDateShortPtBr,
  formatDateTimePtBr,
  getBrazilTodayStartUtc,
} from "@/lib/brazil-time";
import type { ActivityMapPointDTO, ActivityRecentDTO } from "@/lib/activity-admin";
import { buildDemoActivityFeed } from "@/lib/analytics-demo-feed";
import type { AnalyticsQuery } from "@/lib/analytics-params";

const MAP_SAMPLE = 500;
const TIMELINE_SAMPLE = 14_000;
const BURST_WINDOW_MS = 60 * 60 * 1000;
const BURST_MIN_EVENTS = 38;
const MULTI_USER_WINDOW_MS = 24 * 60 * 60 * 1000;
const MULTI_USER_MIN_USERS = 4;
const MULTI_USER_MIN_EVENTS = 12;

export function rangeStartUtc(q: AnalyticsQuery): Date {
  if (q.range === "24h") return new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (q.range === "7d") return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return getBrazilTodayStartUtc();
}

export function buildActivityWhere(q: AnalyticsQuery) {
  const where: {
    createdAt: { gte: Date };
    type?: ActivityEventType;
    countryCode?: string;
  } = {
    createdAt: { gte: rangeStartUtc(q) },
  };
  if (q.type !== "all") where.type = q.type;
  if (q.countryCode) where.countryCode = q.countryCode;
  return where;
}

function brHourBucket(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}`;
}

function brDayBucket(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}`;
}

function countryLabelFromCode(code: string): string {
  try {
    const name = new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(code);
    return name ?? code;
  } catch {
    return code;
  }
}

/** Pontos agregados para o mapa (limite de amostra + grid ~0,1°). */
export async function getActivityMapPointsForQuery(
  q: AnalyticsQuery,
): Promise<ActivityMapPointDTO[]> {
  const rows = await prisma.activityLog.findMany({
    where: {
      ...buildActivityWhere(q),
      lat: { not: null },
      lng: { not: null },
    },
    select: {
      lat: true,
      lng: true,
      type: true,
      countryCode: true,
      city: true,
      country: true,
    },
    orderBy: { createdAt: "desc" },
    take: MAP_SAMPLE,
  });

  const map = new Map<
    string,
    {
      lat: number;
      lng: number;
      count: number;
      types: Set<string>;
      label: string;
    }
  >();

  for (const r of rows) {
    if (r.lat == null || r.lng == null) continue;
    const key = `${r.lat.toFixed(1)},${r.lng.toFixed(1)}`;
    const prev = map.get(key);
    const label =
      r.city?.trim() || r.country?.trim() || r.countryCode || "Localização";
    if (prev) {
      prev.count += 1;
      prev.types.add(r.type);
    } else {
      map.set(key, {
        lat: r.lat,
        lng: r.lng,
        count: 1,
        types: new Set([r.type]),
        label,
      });
    }
  }

  return Array.from(map.values()).map((v) => ({
    lat: v.lat,
    lng: v.lng,
    count: v.count,
    types: [...v.types],
    label: v.label,
  }));
}

export async function getActivityRecentForQuery(
  q: AnalyticsQuery,
  limit = 20,
): Promise<ActivityRecentDTO[]> {
  const cap = Math.min(40, Math.max(5, limit));
  const rows = await prisma.activityLog.findMany({
    where: buildActivityWhere(q),
    orderBy: { createdAt: "desc" },
    take: cap,
    select: {
      id: true,
      type: true,
      country: true,
      countryCode: true,
      city: true,
      amountCents: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    country: r.country,
    countryCode: r.countryCode,
    city: r.city,
    amountCents: r.amountCents,
    createdAt: r.createdAt.toISOString(),
  }));
}

export type AnalyticsKpisDTO = {
  sessionsOnline: number;
  accessesToday: number;
  purchasesToday: number;
  conversionRatePeriod: number;
  topCountryCode: string | null;
  topCountryLabel: string | null;
  topCountryCount: number;
  eventsInPeriod: number;
};

export type AnalyticsSuspiciousDTO = {
  flagged: boolean;
  message: string | null;
  burstCount: number;
  multiAccountCount: number;
};

export type AnalyticsChartsDTO = {
  countries: Array<{ code: string; label: string; count: number }>;
  timeline: Array<{ bucket: string; label: string; count: number }>;
  conversion: {
    accesses: number;
    purchases: number;
    logins: number;
  };
};

export type AnalyticsStatsPayloadDTO = {
  kpis: AnalyticsKpisDTO;
  suspicious: AnalyticsSuspiciousDTO;
  charts: AnalyticsChartsDTO;
  /** Países com eventos no período (para filtro; ignora filtro de país atual). */
  filterCountries: Array<{ code: string; label: string }>;
  query: AnalyticsQuery;
  generatedAt: string;
};

async function detectSuspiciousActivity(): Promise<AnalyticsSuspiciousDTO> {
  const sinceBurst = new Date(Date.now() - BURST_WINDOW_MS);
  const sinceMulti = new Date(Date.now() - MULTI_USER_WINDOW_MS);

  const [bursts, multiRows] = await Promise.all([
    prisma.activityLog.groupBy({
      by: ["ipHash"],
      where: {
        ipHash: { not: null },
        createdAt: { gte: sinceBurst },
      },
      _count: { id: true },
    }),
    prisma.$queryRaw<Array<{ c: bigint }>>`
      SELECT COUNT(*)::int AS c
      FROM (
        SELECT "ipHash"
        FROM "ActivityLog"
        WHERE "ipHash" IS NOT NULL
          AND "createdAt" >= ${sinceMulti}
        GROUP BY "ipHash"
        HAVING COUNT(DISTINCT "userId") >= ${MULTI_USER_MIN_USERS}
          AND COUNT(*) >= ${MULTI_USER_MIN_EVENTS}
      ) t
    `,
  ]);

  const burstCount = bursts.filter(
    (b) => b.ipHash && b._count.id >= BURST_MIN_EVENTS,
  ).length;
  const multiAccountCount = Number(multiRows[0]?.c ?? 0);
  const flagged = burstCount > 0 || multiAccountCount > 0;

  let message: string | null = null;
  if (flagged) {
    const parts: string[] = [];
    if (burstCount > 0) {
      parts.push(
        `${burstCount} origem(ns) com volume muito alto na última hora`,
      );
    }
    if (multiAccountCount > 0) {
      parts.push(
        `${multiAccountCount} padrão(ões) de várias contas no mesmo IP (24h)`,
      );
    }
    message = parts.join(" · ");
  }

  return {
    flagged,
    message,
    burstCount,
    multiAccountCount,
  };
}

export async function getAnalyticsStatsPayload(
  q: AnalyticsQuery,
): Promise<AnalyticsStatsPayloadDTO> {
  const where = buildActivityWhere(q);
  const todayStart = getBrazilTodayStartUtc();

  const whereNoCountry: AnalyticsQuery = { ...q, countryCode: null };

  const [
    sessionsOnline,
    accessesToday,
    purchasesToday,
    eventsInPeriod,
    topCountries,
    accessesPeriod,
    purchasesPeriod,
    loginsPeriod,
    timelineRows,
    suspicious,
    countryFilterRows,
  ] = await Promise.all([
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.activityLog.count({
      where: { type: "access", createdAt: { gte: todayStart } },
    }),
    prisma.activityLog.count({
      where: { type: "purchase", createdAt: { gte: todayStart } },
    }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.groupBy({
      by: ["countryCode"],
      where: { ...where, countryCode: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.activityLog.count({
      where: { ...where, type: "access" },
    }),
    prisma.activityLog.count({
      where: { ...where, type: "purchase" },
    }),
    prisma.activityLog.count({
      where: { ...where, type: "login" },
    }),
    prisma.activityLog.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
      take: TIMELINE_SAMPLE,
    }),
    detectSuspiciousActivity(),
    prisma.activityLog.groupBy({
      by: ["countryCode"],
      where: {
        ...buildActivityWhere(whereNoCountry),
        countryCode: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 32,
    }),
  ]);

  const top = topCountries[0];
  const topCountryCode = top?.countryCode ?? null;
  const conversionRatePeriod =
    accessesPeriod > 0
      ? Math.min(1, purchasesPeriod / accessesPeriod)
      : purchasesPeriod > 0
        ? 1
        : 0;

  const granularity: "hour" | "day" = q.range === "7d" ? "day" : "hour";
  const bucketFn = granularity === "day" ? brDayBucket : brHourBucket;
  const timelineMap = new Map<
    string,
    { count: number; sample: Date }
  >();
  for (const row of timelineRows) {
    const key = bucketFn(row.createdAt);
    const cur = timelineMap.get(key);
    if (cur) {
      cur.count += 1;
    } else {
      timelineMap.set(key, { count: 1, sample: row.createdAt });
    }
  }
  const timeline = [...timelineMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, v]) => ({
      bucket,
      label:
        granularity === "day"
          ? formatDateShortPtBr(v.sample)
          : formatDateTimePtBr(v.sample, {
              dateStyle: "short",
              timeStyle: "short",
            }),
      count: v.count,
    }));

  const countries = topCountries.map((row) => ({
    code: row.countryCode!,
    label: countryLabelFromCode(row.countryCode!),
    count: row._count.id,
  }));

  const filterCountries = countryFilterRows.map((row) => ({
    code: row.countryCode!,
    label: countryLabelFromCode(row.countryCode!),
  }));

  return {
    kpis: {
      sessionsOnline,
      accessesToday,
      purchasesToday,
      conversionRatePeriod,
      topCountryCode,
      topCountryLabel: topCountryCode
        ? countryLabelFromCode(topCountryCode)
        : null,
      topCountryCount: top?._count.id ?? 0,
      eventsInPeriod,
    },
    suspicious,
    charts: {
      countries,
      timeline,
      conversion: {
        accesses: accessesPeriod,
        purchases: purchasesPeriod,
        logins: loginsPeriod,
      },
    },
    filterCountries,
    query: q,
    generatedAt: new Date().toISOString(),
  };
}

export type AnalyticsPageSeed = {
  query: AnalyticsQuery;
  points: ActivityMapPointDTO[];
  events: ActivityRecentDTO[];
  /** Cenário demo com timestamps fixos no snapshot do servidor (evita mismatch de hidratação). */
  demoActivityFeed: ActivityRecentDTO[];
  stats: AnalyticsStatsPayloadDTO;
};

export async function getAnalyticsPageSeed(): Promise<AnalyticsPageSeed> {
  const query: AnalyticsQuery = {
    range: "24h",
    type: "all",
    countryCode: null,
  };
  const [points, events, stats] = await Promise.all([
    getActivityMapPointsForQuery(query),
    getActivityRecentForQuery(query, 20),
    getAnalyticsStatsPayload(query),
  ]);
  return {
    query,
    points,
    events,
    demoActivityFeed: buildDemoActivityFeed(),
    stats,
  };
}
