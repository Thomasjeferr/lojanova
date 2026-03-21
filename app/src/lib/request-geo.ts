/**
 * Resolve geolocalização a partir do request (Vercel injeta headers; dev/local usa ip-api).
 * Não armazena IP — só país/cidade/coordenadas aproximadas.
 */

export type ResolvedGeo = {
  country: string | null;
  countryCode: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
};

export function clientIpFromHeaders(h: Headers): string | null {
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && first !== "unknown") return first;
  }
  const real = h.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return null;
}

function enrichCountryName(geo: ResolvedGeo): ResolvedGeo {
  if (geo.country) return geo;
  if (geo.countryCode) {
    try {
      const name = new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(
        geo.countryCode,
      );
      return { ...geo, country: name ?? geo.countryCode };
    } catch {
      return { ...geo, country: geo.countryCode };
    }
  }
  return geo;
}

/** Headers que a Vercel define em produção (sem custo extra). */
function geoFromVercelHeaders(h: Headers): ResolvedGeo | null {
  const countryCode = h.get("x-vercel-ip-country")?.trim().toUpperCase() || null;
  const city = h.get("x-vercel-ip-city")?.trim() || null;
  const latStr = h.get("x-vercel-ip-latitude");
  const lngStr = h.get("x-vercel-ip-longitude");
  const lat = latStr != null && latStr !== "" ? Number.parseFloat(latStr) : NaN;
  const lng = lngStr != null && lngStr !== "" ? Number.parseFloat(lngStr) : NaN;

  if (!countryCode && !Number.isFinite(lat)) {
    return null;
  }

  return enrichCountryName({
    country: null,
    countryCode,
    city,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  });
}

async function geoFromIpApi(ip: string): Promise<ResolvedGeo | null> {
  if (
    !ip ||
    ip === "unknown" ||
    ip.startsWith("127.") ||
    ip === "::1"
  ) {
    return null;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,lat,lon`,
      { signal: ctrl.signal, cache: "no-store" },
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
      lat?: number;
      lon?: number;
    };
    if (data.status !== "success") return null;
    return {
      country: data.country ?? null,
      countryCode: data.countryCode?.toUpperCase() ?? null,
      city: data.city ?? null,
      lat: typeof data.lat === "number" ? data.lat : null,
      lng: typeof data.lon === "number" ? data.lon : null,
    };
  } catch {
    return null;
  }
}

export async function resolveRequestGeo(request: Request): Promise<ResolvedGeo | null> {
  return resolveGeoFromHeaders(request.headers);
}

export async function resolveGeoFromHeaders(h: Headers): Promise<ResolvedGeo | null> {
  const v = geoFromVercelHeaders(h);
  if (v && (v.lat != null || v.countryCode)) {
    return v;
  }

  const ip = clientIpFromHeaders(h);
  if (!ip) return null;
  const fromApi = await geoFromIpApi(ip);
  if (!fromApi) return null;
  return enrichCountryName(fromApi);
}
