import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { createOrderSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

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

    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        planId: plan.id,
        amountCents: plan.priceCents,
        status: "pending",
      },
    });

    return ok({ orderId: order.id, status: order.status });
  } catch (e) {
    if (e instanceof Error && e.message === "Não autenticado") {
      return unauthorized();
    }
    console.error("[checkout/create-order]", e);
    return badRequest("Não foi possível criar o pedido. Tente novamente.");
  }
}
