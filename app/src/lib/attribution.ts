const FIRST_TOUCH_COOKIE = "lnp_ft";
const LAST_TOUCH_COOKIE = "lnp_lt";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 dias

export type AttributionTouch = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  clickId: string | null;
  referrer: string | null;
  landingPath: string | null;
  capturedAt: string;
};

export type OrderAttribution = {
  firstTouch: AttributionTouch | null;
  lastTouch: AttributionTouch | null;
  capturedAtOrder: string;
};

function sanitize(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  return t ? t.slice(0, 300) : null;
}

export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (!p.startsWith(`${name}=`)) continue;
    return p.slice(name.length + 1);
  }
  return null;
}

export function decodeTouchCookie(encoded: string | null): AttributionTouch | null {
  if (!encoded) return null;
  try {
    const raw = decodeURIComponent(encoded);
    const parsed = safeJsonParse<AttributionTouch>(raw);
    if (!parsed) return null;
    return {
      source: sanitize(parsed.source),
      medium: sanitize(parsed.medium),
      campaign: sanitize(parsed.campaign),
      content: sanitize(parsed.content),
      term: sanitize(parsed.term),
      clickId: sanitize(parsed.clickId),
      referrer: sanitize(parsed.referrer),
      landingPath: sanitize(parsed.landingPath),
      capturedAt: sanitize(parsed.capturedAt) ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function firstTouchCookieName(): string {
  return FIRST_TOUCH_COOKIE;
}
export function lastTouchCookieName(): string {
  return LAST_TOUCH_COOKIE;
}
export function touchCookieMaxAgeSeconds(): number {
  return COOKIE_MAX_AGE_SECONDS;
}

export function buildSourceLabel(source: string | null, medium: string | null): string {
  if (source && medium) return `${source} / ${medium}`;
  if (source) return source;
  if (medium) return medium;
  return "direto";
}
