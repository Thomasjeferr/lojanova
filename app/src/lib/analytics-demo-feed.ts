import type { ActivityRecentDTO } from "@/lib/activity-admin";

/** Feed de demonstração quando não há eventos reais (sensação de painel vivo). */
export function buildDemoActivityFeed(): ActivityRecentDTO[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(now - ms).toISOString();
  return [
    {
      id: "demo-sp",
      type: "purchase",
      country: "Brasil",
      countryCode: "BR",
      city: "São Paulo",
      amountCents: 6500,
      createdAt: iso(2_000),
    },
    {
      id: "demo-mia",
      type: "access",
      country: "Estados Unidos",
      countryCode: "US",
      city: "Miami",
      amountCents: null,
      createdAt: iso(8_000),
    },
    {
      id: "demo-lx",
      type: "login",
      country: "Portugal",
      countryCode: "PT",
      city: "Lisboa",
      amountCents: null,
      createdAt: iso(18_000),
    },
    {
      id: "demo-rj",
      type: "purchase",
      country: "Brasil",
      countryCode: "BR",
      city: "Rio de Janeiro",
      amountCents: 12900,
      createdAt: iso(32_000),
    },
    {
      id: "demo-ldn",
      type: "access",
      country: "Reino Unido",
      countryCode: "GB",
      city: "Londres",
      amountCents: null,
      createdAt: iso(55_000),
    },
  ];
}
