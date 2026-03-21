import { prisma } from "@/lib/prisma";
import { getBrazilTodayStartUtc } from "@/lib/brazil-time";

export type ActivityMapPointDTO = {
  lat: number;
  lng: number;
  count: number;
  types: string[];
  label: string;
};

/** Pontos agregados (90 dias, até 400 eventos) para o mapa. */
export async function getActivityMapPoints(): Promise<ActivityMapPointDTO[]> {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const rows = await prisma.activityLog.findMany({
    where: {
      createdAt: { gte: since },
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
    take: 400,
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
      r.city?.trim() ||
      r.country?.trim() ||
      r.countryCode ||
      "Localização";
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

export type ActivityRecentDTO = {
  id: string;
  type: "login" | "purchase" | "access";
  country: string | null;
  countryCode: string | null;
  city: string | null;
  amountCents: number | null;
  createdAt: string;
};

export async function getActivityRecent(limit = 40): Promise<ActivityRecentDTO[]> {
  const rows = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
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

export type ActivityDashboardSummaryDTO = {
  todayCount: number;
  topCountryCode: string | null;
  topCountryCount: number;
  lastActivity: {
    type: string;
    countryCode: string | null;
    city: string | null;
    country: string | null;
    amountCents: number | null;
    createdAt: string;
  } | null;
  sessionsOnline: number;
};

export async function getActivityDashboardSummary(): Promise<ActivityDashboardSummaryDTO> {
  const todayStart = getBrazilTodayStartUtc();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [todayCount, grouped, last, sessionsOnline] = await Promise.all([
    prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.activityLog.groupBy({
      by: ["countryCode"],
      where: {
        countryCode: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
    prisma.activityLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
        countryCode: true,
        city: true,
        country: true,
        amountCents: true,
        createdAt: true,
      },
    }),
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
  ]);

  const top = grouped[0];
  return {
    todayCount,
    topCountryCode: top?.countryCode ?? null,
    topCountryCount: top?._count.id ?? 0,
    lastActivity: last
      ? {
          type: last.type,
          countryCode: last.countryCode,
          city: last.city,
          country: last.country,
          amountCents: last.amountCents,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
    sessionsOnline,
  };
}
