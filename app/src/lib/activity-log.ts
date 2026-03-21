import { after } from "next/server";
import type { ActivityEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  clientIpFromHeaders,
  resolveGeoFromHeaders,
  resolveRequestGeo,
  type ResolvedGeo,
} from "@/lib/request-geo";
import { hashClientIp, truncateUserAgent } from "@/lib/ip-hash";

const ACCESS_DEBOUNCE_MS = 4 * 60 * 60 * 1000;

async function persistActivity(input: {
  userId: string;
  type: ActivityEventType;
  orderId?: string | null;
  amountCents?: number | null;
  geo: ResolvedGeo | null;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  await prisma.activityLog.create({
    data: {
      userId: input.userId,
      type: input.type,
      orderId: input.orderId ?? undefined,
      amountCents: input.amountCents ?? undefined,
      country: input.geo?.country ?? undefined,
      countryCode: input.geo?.countryCode ?? undefined,
      city: input.geo?.city ?? undefined,
      lat: input.geo?.lat ?? undefined,
      lng: input.geo?.lng ?? undefined,
      ipHash: input.ipHash ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}

/** Geo a partir do último evento com coordenadas do usuário (webhooks de pagamento). */
async function fallbackGeoForUser(userId: string): Promise<ResolvedGeo | null> {
  const last = await prisma.activityLog.findFirst({
    where: {
      userId,
      lat: { not: null },
      lng: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      country: true,
      countryCode: true,
      city: true,
      lat: true,
      lng: true,
    },
  });
  if (!last?.lat || !last?.lng) return null;
  return {
    country: last.country,
    countryCode: last.countryCode,
    city: last.city,
    lat: last.lat,
    lng: last.lng,
  };
}

const BRAZIL_CENTER: ResolvedGeo = {
  country: "Brasil",
  countryCode: "BR",
  city: null,
  lat: -14.235,
  lng: -51.9253,
};

export async function recordLoginActivity(userId: string, request: Request) {
  try {
    const geo = (await resolveRequestGeo(request)) ?? BRAZIL_CENTER;
    const ip = clientIpFromHeaders(request.headers);
    await persistActivity({
      userId,
      type: "login",
      geo,
      ipHash: hashClientIp(ip),
      userAgent: truncateUserAgent(request.headers.get("user-agent")),
    });
  } catch (e) {
    console.error("[activity-log] login", e);
  }
}

export async function recordAccessActivity(userId: string, headers: Headers) {
  try {
    const recent = await prisma.activityLog.findFirst({
      where: {
        userId,
        type: "access",
        createdAt: { gte: new Date(Date.now() - ACCESS_DEBOUNCE_MS) },
      },
    });
    if (recent) return;

    const geo = (await resolveGeoFromHeaders(headers)) ?? BRAZIL_CENTER;
    const ip = clientIpFromHeaders(headers);
    await persistActivity({
      userId,
      type: "access",
      geo,
      ipHash: hashClientIp(ip),
      userAgent: truncateUserAgent(headers.get("user-agent")),
    });
  } catch (e) {
    console.error("[activity-log] access", e);
  }
}

export async function recordPurchaseActivity(input: {
  userId: string;
  orderId: string;
  amountCents: number;
  request?: Request;
}) {
  try {
    let geo: ResolvedGeo | null = null;
    if (input.request) {
      geo = await resolveRequestGeo(input.request);
    }
    if (!geo?.lat) {
      geo = (await fallbackGeoForUser(input.userId)) ?? BRAZIL_CENTER;
    }
    let ipHash: string | null = null;
    let userAgent: string | null = null;
    if (input.request) {
      ipHash = hashClientIp(clientIpFromHeaders(input.request.headers));
      userAgent = truncateUserAgent(input.request.headers.get("user-agent"));
    }
    await persistActivity({
      userId: input.userId,
      type: "purchase",
      orderId: input.orderId,
      amountCents: input.amountCents,
      geo,
      ipHash,
      userAgent,
    });
  } catch (e) {
    console.error("[activity-log] purchase", e);
  }
}

/** Agenda gravação de compra após entrega (contexto de request do Next). */
export function schedulePurchaseActivity(input: {
  userId: string;
  orderId: string;
  amountCents: number;
  request?: Request;
}) {
  after(async () => {
    await recordPurchaseActivity(input);
  });
}
