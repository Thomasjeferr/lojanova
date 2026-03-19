import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) return badRequest("orderId é obrigatório");

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: auth.userId },
      include: { activationCode: { select: { code: true } } },
    });
    if (!order) return badRequest("Pedido não encontrado");

    return ok({
      status: order.status,
      code: order.activationCode?.code || null,
      paidAt: order.paidAt,
    });
  } catch {
    return unauthorized();
  }
}
