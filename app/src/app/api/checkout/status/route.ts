import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { credentialKindLabel, renderCredentialLine } from "@/lib/activation-credentials";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";
import { fetchGgPixTransactionById } from "@/lib/ggpix";
import { fetchWooviChargeStatus, isWooviChargePaidStatus } from "@/lib/woovi";
import { deliverActivationCode } from "@/lib/delivery";

export async function GET(request: Request) {
  try {
    const auth = await requireUser();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    if (!orderId) return badRequest("orderId é obrigatório");

    let order = await prisma.order.findFirst({
      where: { id: orderId, userId: auth.userId },
      include: {
        activationCode: {
          select: { code: true, status: true, credentialType: true, username: true, password: true },
        },
      },
    });
    if (!order) return badRequest("Pedido não encontrado");

    if (order.status === "pending") {
      const settings = await getPaymentGatewaySettings();
      if (settings.paymentProvider === "ggpix") {
        const apiKey = settings.ggpixApiKey || process.env.GGPIX_API_KEY || "";
        const txRef = order.wooviChargeId || order.wooviTxid;
        if (apiKey.trim() && txRef) {
          try {
            const remote = await fetchGgPixTransactionById(txRef, apiKey);
            const st = remote?.status?.toUpperCase() ?? "";
            if (st === "COMPLETE" || st === "PAID") {
              await deliverActivationCode(order.id, { request });
              const refreshed = await prisma.order.findFirst({
                where: { id: orderId, userId: auth.userId },
                include: {
                  activationCode: {
                    select: { code: true, status: true, credentialType: true, username: true, password: true },
                  },
                },
              });
              if (refreshed) order = refreshed;
            }
          } catch (e) {
            console.error("[checkout/status] sync GGPIX", e);
          }
        }
      }
      if (settings.paymentProvider === "woovi") {
        const apiKey = settings.wooviApiKey || process.env.WOOVI_API_KEY || "";
        const tryIds = [order.wooviChargeId, order.wooviTxid].filter(
          (v): v is string => Boolean(v?.trim()),
        );
        if (apiKey.trim() && tryIds.length > 0) {
          try {
            let paidRemote = false;
            for (const ref of tryIds) {
              const remoteStatus = await fetchWooviChargeStatus(ref, apiKey);
              if (remoteStatus && isWooviChargePaidStatus(remoteStatus)) {
                paidRemote = true;
                break;
              }
            }
            if (paidRemote) {
              await deliverActivationCode(order.id, { request });
              const refreshed = await prisma.order.findFirst({
                where: { id: orderId, userId: auth.userId },
                include: {
                  activationCode: {
                    select: { code: true, status: true, credentialType: true, username: true, password: true },
                  },
                },
              });
              if (refreshed) order = refreshed;
            }
          } catch (e) {
            console.error("[checkout/status] sync Woovi", e);
          }
        }
      }
    }

    const ac = order.activationCode;
    const canRevealCredential = order.status === "paid" && ac?.status === "sold";
    const codeLine = canRevealCredential && ac
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
      credential: canRevealCredential && ac
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
