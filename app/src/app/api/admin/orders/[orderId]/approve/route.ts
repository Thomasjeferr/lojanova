import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { adminFulfillOrResendOrder } from "@/lib/delivery";
import { renderCredentialLine } from "@/lib/activation-credentials";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return forbidden();
  }

  const { orderId } = await context.params;
  if (!orderId?.trim()) {
    return badRequest("Pedido inválido");
  }

  try {
    const result = await adminFulfillOrResendOrder(orderId.trim(), { request });
    const updated = await prisma.order.findUnique({
      where: { id: orderId.trim() },
      include: {
        activationCode: {
          select: { code: true, credentialType: true, username: true, password: true },
        },
      },
    });
    const code =
      updated?.activationCode != null
        ? renderCredentialLine({
            credentialType: updated.activationCode.credentialType,
            code: updated.activationCode.code,
            username: updated.activationCode.username,
            password: updated.activationCode.password,
          })
        : result.codeLine;

    const messages: Record<string, string> = {
      delivered_new: "Pedido aprovado. Código enviado por e-mail e SMS.",
      resent: "E-mail e SMS reenviados com o acesso.",
      recovered: "Entrega concluída. E-mail e SMS enviados.",
    };

    return ok({
      message: messages[result.kind] ?? "Operação concluída.",
      kind: result.kind,
      order: updated
        ? {
            id: updated.id,
            status: updated.status,
            paidAt: updated.paidAt?.toISOString() ?? null,
            code,
          }
        : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar pedido";
    return badRequest(msg);
  }
}
