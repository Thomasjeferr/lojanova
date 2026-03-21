import { prisma } from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/email";
import { sendActivationSms } from "@/lib/twilio-sms";
import {
  credentialKindLabel,
  renderCredentialLine,
} from "@/lib/activation-credentials";
import { schedulePurchaseActivity } from "@/lib/activity-log";

export async function deliverActivationCode(
  orderId: string,
  options?: { request?: Request },
) {
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
        notifyChannels: false as const,
        deliveredCode: order.activationCode
          ? renderCredentialLine({
              credentialType: order.activationCode.credentialType,
              code: order.activationCode.code,
              username: order.activationCode.username,
              password: order.activationCode.password,
            })
          : "",
        credentialLabel: order.activationCode
          ? credentialKindLabel(order.activationCode.credentialType)
          : "Credencial",
        user: order.user,
        plan: order.plan,
      };
    }

    // Lock de linha para evitar entrega duplicada do mesmo código
    const availableCodeRows = await tx.$queryRaw<
      Array<{
        id: string;
        code: string;
        credentialType: "activation_code" | "username_password";
        username: string | null;
        password: string | null;
      }>
    >`
      SELECT id, code, "credentialType", username, password
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
      notifyChannels: true as const,
      deliveredCode: renderCredentialLine({
        credentialType: availableCode.credentialType,
        code: availableCode.code,
        username: availableCode.username,
        password: availableCode.password,
      }),
      credentialLabel: credentialKindLabel(availableCode.credentialType),
      user: order.user,
      plan: order.plan,
      order: paidOrder,
    };
  });

  if (result.notifyChannels) {
    await sendActivationEmail({
      to: result.user.email,
      name: result.user.name,
      planName: result.plan.title,
      credentialLabel: result.credentialLabel,
      credentialValue: result.deliveredCode,
    });
    await sendActivationSms({
      phone: result.user.phone,
      name: result.user.name,
      planName: result.plan.title,
      credentialLabel: result.credentialLabel,
      credentialValue: result.deliveredCode,
    });
  }

  if (result.notifyChannels && "order" in result && result.order) {
    schedulePurchaseActivity({
      userId: result.user.id,
      orderId: result.order.id,
      amountCents: result.order.amountCents,
      request: options?.request,
    });
  }

  return result.deliveredCode;
}
