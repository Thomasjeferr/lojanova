import { prisma } from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/email";
import { sendActivationSms } from "@/lib/twilio-sms";
import {
  credentialKindLabel,
  renderCredentialLine,
} from "@/lib/activation-credentials";
import { schedulePurchaseActivity } from "@/lib/activity-log";
import { releaseExpiredPixReservationsTx } from "@/lib/pix-reservation";

export async function deliverActivationCode(
  orderId: string,
  options?: { request?: Request },
) {
  const result = await prisma.$transaction(async (tx) => {
    await releaseExpiredPixReservationsTx(tx);

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { plan: true, user: true, activationCode: true, delivery: true },
    });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.delivery) {
      // Autocura de inconsistência histórica:
      // se já existe entrega registrada, o pedido deve estar pago e o código vendido.
      if (order.status !== "paid") {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "paid",
            paidAt: order.paidAt ?? new Date(),
          },
        });
      }
      if (order.activationCode?.status === "reserved") {
        await tx.activationCode.update({
          where: { id: order.activationCode.id },
          data: {
            status: "sold",
            reservedUntil: null,
          },
        });
      }
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

    const reserved = order.activationCode;
    if (reserved?.status === "reserved" && reserved.planId === order.planId) {
      await tx.activationCode.update({
        where: { id: reserved.id },
        data: {
          status: "sold",
          reservedUntil: null,
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
          activationCodeId: reserved.id,
          status: "delivered",
          message: "Código entregue com sucesso",
        },
      });

      return {
        notifyChannels: true as const,
        deliveredCode: renderCredentialLine({
          credentialType: reserved.credentialType,
          code: reserved.code,
          username: reserved.username,
          password: reserved.password,
        }),
        credentialLabel: credentialKindLabel(reserved.credentialType),
        user: order.user,
        plan: order.plan,
        order: paidOrder,
      };
    }

    // Pedidos antigos ou sem reserva: pega próximo disponível com lock
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

export type AdminFulfillKind = "delivered_new" | "resent" | "recovered";

export type AdminFulfillResult = {
  kind: AdminFulfillKind;
  codeLine: string;
};

/**
 * Aprovação manual (admin): entrega código + e-mail/SMS quando o gateway falhou,
 * ou apenas reenvia as notificações se a entrega já existir.
 */
export async function adminFulfillOrResendOrder(
  orderId: string,
  options?: { request?: Request },
): Promise<AdminFulfillResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      plan: true,
      activationCode: true,
      delivery: true,
    },
  });

  if (!order) {
    throw new Error("Pedido não encontrado");
  }
  if (order.status === "cancelled") {
    throw new Error("Pedido cancelado não pode ser aprovado.");
  }

  const notify = async (codeLine: string, credentialLabel: string) => {
    await sendActivationEmail({
      to: order.user.email,
      name: order.user.name,
      planName: order.plan.title,
      credentialLabel,
      credentialValue: codeLine,
    });
    await sendActivationSms({
      phone: order.user.phone,
      name: order.user.name,
      planName: order.plan.title,
      credentialLabel,
      credentialValue: codeLine,
    });
  };

  if (order.delivery && order.activationCode) {
    if (order.status !== "paid") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
          paidAt: order.paidAt ?? new Date(),
        },
      });
    }
    if (order.activationCode.status === "reserved") {
      await prisma.activationCode.update({
        where: { id: order.activationCode.id },
        data: {
          status: "sold",
          reservedUntil: null,
        },
      });
    }
    const codeLine = renderCredentialLine({
      credentialType: order.activationCode.credentialType,
      code: order.activationCode.code,
      username: order.activationCode.username,
      password: order.activationCode.password,
    });
    const credentialLabel = credentialKindLabel(order.activationCode.credentialType);
    await notify(codeLine, credentialLabel);
    return { kind: "resent", codeLine };
  }

  if (order.status === "pending" || order.status === "failed") {
    const codeLine = await deliverActivationCode(orderId, options);
    return { kind: "delivered_new", codeLine };
  }

  if (order.status === "paid" && order.activationCode && !order.delivery) {
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        activationCodeId: order.activationCode.id,
        status: "delivered",
        message: "Entrega registrada manualmente (admin)",
      },
    });
    const codeLine = renderCredentialLine({
      credentialType: order.activationCode.credentialType,
      code: order.activationCode.code,
      username: order.activationCode.username,
      password: order.activationCode.password,
    });
    const credentialLabel = credentialKindLabel(order.activationCode.credentialType);
    await notify(codeLine, credentialLabel);
    schedulePurchaseActivity({
      userId: order.userId,
      orderId: order.id,
      amountCents: order.amountCents,
      request: options?.request,
    });
    return { kind: "recovered", codeLine };
  }

  throw new Error(
    "Não é possível aprovar este pedido no estado atual (confira status e estoque de códigos).",
  );
}
