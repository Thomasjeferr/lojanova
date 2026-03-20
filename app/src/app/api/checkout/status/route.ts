import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { renderCredentialLine } from "@/lib/activation-credentials";

export async function GET(request: Request) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) return badRequest("orderId é obrigatório");

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: auth.userId },
      include: {
        activationCode: { select: { code: true, credentialType: true, username: true, password: true } },
      },
    });
    if (!order) return badRequest("Pedido não encontrado");

    return ok({
      status: order.status,
      code: order.activationCode
        ? renderCredentialLine({
            credentialType: order.activationCode.credentialType,
            code: order.activationCode.code,
            username: order.activationCode.username,
            password: order.activationCode.password,
          })
        : null,
      paidAt: order.paidAt,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Não autenticado") {
      return unauthorized();
    }
    console.error("[checkout/status]", e);
    return badRequest("Não foi possível consultar o pedido.");
  }
}
