"use client";

import { useEffect } from "react";
import {
  firstTouchCookieName,
  lastTouchCookieName,
  touchCookieMaxAgeSeconds,
  type AttributionTouch,
} from "@/lib/attribution";

function sanitize(v: string | null): string | null {
  if (!v) return null;
  const t = v.trim();
  return t ? t.slice(0, 300) : null;
}

function referrerHost(ref: string): string | null {
  try {
    const u = new URL(ref);
    return sanitize(u.hostname);
  } catch {
    return null;
  }
}

function pickClickId(url: URL): string | null {
  const keys = ["gclid", "fbclid", "ttclid", "msclkid"];
  for (const k of keys) {
    const v = sanitize(url.searchParams.get(k));
    if (v) return v;
  }
  return null;
}

function currentTouch(): AttributionTouch {
  const url = new URL(window.location.href);
  return {
    source: sanitize(url.searchParams.get("utm_source")),
    medium: sanitize(url.searchParams.get("utm_medium")),
    campaign: sanitize(url.searchParams.get("utm_campaign")),
    content: sanitize(url.searchParams.get("utm_content")),
    term: sanitize(url.searchParams.get("utm_term")),
    clickId: pickClickId(url),
    referrer: referrerHost(document.referrer),
    landingPath: sanitize(`${url.pathname}${url.search}`),
    capturedAt: new Date().toISOString(),
  };
}

function hasAttributionSignal(t: AttributionTouch): boolean {
  return Boolean(
    t.source ||
      t.medium ||
      t.campaign ||
      t.content ||
      t.term ||
      t.clickId ||
      t.referrer,
  );
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${touchCookieMaxAgeSeconds()}; Path=/; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (!p.startsWith(`${name}=`)) continue;
    return p.slice(name.length + 1);
  }
  return null;
}

export function TrackingCapture() {
  useEffect(() => {
    const nowTouch = currentTouch();
    const firstCookie = readCookie(firstTouchCookieName());
    if (!firstCookie) {
      setCookie(firstTouchCookieName(), JSON.stringify(nowTouch));
    }

    // last-touch só atualiza quando há algum sinal novo.
    if (hasAttributionSignal(nowTouch)) {
      setCookie(lastTouchCookieName(), JSON.stringify(nowTouch));
    }
  }, []);

  return null;
}
