import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { credentialKindLabel, renderCredentialLine } from "@/lib/activation-credentials";

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

    const ac = order.activationCode;
    const codeLine = ac
      ? renderCredentialLine({
          credentialType: ac.credentialType,
          code: ac.code,
          username: ac.username,
          password: ac.password,
        })
      : null;

    return ok({
      status: order.status,
      code: codeLine,
      paidAt: order.paidAt,
      credential: ac
        ? {
            type: ac.credentialType,
            kindLabel: credentialKindLabel(ac.credentialType),
            activationCode: ac.credentialType === "activation_code" ? ac.code : null,
            username: ac.credentialType === "username_password" ? ac.username : null,
            password: ac.credentialType === "username_password" ? ac.password : null,
          }
        : null,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Não autenticado") {
      return unauthorized();
    }
    console.error("[checkout/status]", e);
    return badRequest("Não foi possível consultar o pedido.");
  }
}
