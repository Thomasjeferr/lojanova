import type { ActivityEventType } from "@prisma/client";

export type AnalyticsRange = "today" | "24h" | "7d";
export type AnalyticsEventFilter = "all" | ActivityEventType;

export type AnalyticsQuery = {
  range: AnalyticsRange;
  type: AnalyticsEventFilter;
  /** ISO 3166-1 alpha-2 ou null = todos */
  countryCode: string | null;
};

export function parseAnalyticsQueryParams(
  sp: URLSearchParams,
): AnalyticsQuery {
  const rangeRaw = sp.get("range");
  const range: AnalyticsRange =
    rangeRaw === "today" || rangeRaw === "7d" ? rangeRaw : "24h";

  const typeRaw = sp.get("type");
  const type: AnalyticsEventFilter =
    typeRaw === "login" || typeRaw === "purchase" || typeRaw === "access"
      ? typeRaw
      : "all";

  const c = sp.get("country")?.trim().toUpperCase() ?? null;
  const countryCode =
    c && c.length === 2 && /^[A-Z]{2}$/.test(c) ? c : null;

  return { range, type, countryCode };
}

export function analyticsQueryToSearchParams(q: AnalyticsQuery): string {
  const p = new URLSearchParams();
  p.set("range", q.range);
  if (q.type !== "all") p.set("type", q.type);
  if (q.countryCode) p.set("country", q.countryCode);
  return p.toString();
}
