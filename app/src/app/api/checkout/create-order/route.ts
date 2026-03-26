import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { createOrderSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  buildSourceLabel,
  decodeTouchCookie,
  firstTouchCookieName,
  lastTouchCookieName,
  readCookieValue,
} from "@/lib/attribution";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rate = await checkRateLimit(`checkout:${ip}`, 12, 60);
    if (!rate.success) {
      return badRequest("Muitas tentativas. Tente novamente.");
    }

    const parsed = createOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }

    const plan = await prisma.plan.findFirst({
      where: { id: parsed.data.planId, isActive: true },
    });
    if (!plan) {
      return badRequest("Plano indisponível");
    }

    const cookieHeader = request.headers.get("cookie");
    const firstTouch = decodeTouchCookie(readCookieValue(cookieHeader, firstTouchCookieName()));
    const lastTouch = decodeTouchCookie(readCookieValue(cookieHeader, lastTouchCookieName()));

    const snapshot = {
      firstTouch,
      lastTouch,
      capturedAtOrder: new Date().toISOString(),
    };
    const source = firstTouch?.source ?? null;
    const medium = firstTouch?.medium ?? null;
    const campaign = firstTouch?.campaign ?? null;
    const referrer = firstTouch?.referrer ?? null;
    const landingPath = firstTouch?.landingPath ?? null;

    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        planId: plan.id,
        amountCents: plan.priceCents,
        status: "pending",
        attribution: snapshot,
        attributionSource: source,
        attributionMedium: medium,
        attributionCampaign: campaign,
        attributionReferrer: referrer,
        attributionLandingPath: landingPath,
      },
    });

    return ok({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      attributionSourceLabel: buildSourceLabel(source, medium),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Não autenticado") {
      return unauthorized();
    }
    console.error("[checkout/create-order]", e);
    return badRequest("Não foi possível criar o pedido. Tente novamente.");
  }
}
