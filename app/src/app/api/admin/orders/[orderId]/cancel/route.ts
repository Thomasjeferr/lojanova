import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return forbidden();
  }

  const { orderId } = await context.params;
  const id = orderId?.trim();
  if (!id) return badRequest("Pedido inválido");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          activationCode: {
            select: { id: true, status: true },
          },
          delivery: { select: { id: true } },
        },
      });
      if (!order) throw new Error("Pedido não encontrado");
      if (order.status === "cancelled") throw new Error("Pedido já está cancelado");
      if (order.status === "paid") {
        throw new Error("Pedido pago não pode ser cancelado por esta ação.");
      }
      if (order.delivery) {
        throw new Error("Pedido com entrega registrada não pode ser cancelado.");
      }

      let releasedCode = false;
      if (order.activationCode?.status === "reserved") {
        await tx.activationCode.update({
          where: { id: order.activationCode.id },
          data: {
            status: "available",
            orderId: null,
            reservedUntil: null,
          },
        });
        releasedCode = true;
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
        },
      });

      return { updated, releasedCode };
    });

    return ok({
      message: result.releasedCode
        ? "Pedido cancelado e código reservado devolvido ao estoque."
        : "Pedido cancelado.",
      order: {
        id: result.updated.id,
        status: result.updated.status,
        paidAt: result.updated.paidAt?.toISOString() ?? null,
        code: null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao cancelar pedido";
    return badRequest(msg);
  }
}
