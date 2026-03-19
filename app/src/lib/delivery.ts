import { prisma } from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/email";

export async function deliverActivationCode(orderId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { plan: true, user: true, activationCode: true, delivery: true },
    });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.delivery) {
      return {
        deliveredCode: order.activationCode?.code || "",
        user: order.user,
        plan: order.plan,
      };
    }

    // Lock de linha para evitar entrega duplicada do mesmo código
    const availableCodeRows = await tx.$queryRaw<Array<{ id: string; code: string }>>`
      SELECT id, code
      FROM "ActivationCode"
      WHERE "planId" = ${order.planId}
        AND status = 'available'
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    const availableCode = availableCodeRows[0];
    if (!availableCode) {
      throw new Error("Sem códigos disponíveis para este plano");
    }

    await tx.activationCode.update({
      where: { id: availableCode.id },
      data: {
        status: "sold",
        orderId: order.id,
      },
    });

    const paidOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    await tx.delivery.create({
      data: {
        orderId: order.id,
        activationCodeId: availableCode.id,
        status: "delivered",
        message: "Código entregue com sucesso",
      },
    });

    return {
      deliveredCode: availableCode.code,
      user: order.user,
      plan: order.plan,
      order: paidOrder,
    };
  });

  await sendActivationEmail({
    to: result.user.email,
    name: result.user.name,
    planName: result.plan.title,
    code: result.deliveredCode,
  });

  return result.deliveredCode;
}
