import { prisma } from "@/lib/prisma";
import { deliverActivationCode } from "@/lib/delivery";
import { fetchGgPixTransactionById } from "@/lib/ggpix";
import { fetchWooviChargeStatus, isWooviChargePaidStatus } from "@/lib/woovi";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";

const PENDING_MAX_AGE_HOURS = 72;
/** Evita estourar timeout do serverless e rate limit do gateway. */
const MAX_ORDERS_PER_RUN = 25;

function isGgPixPaidStatus(st: string): boolean {
  const s = st.toUpperCase();
  return (
    s === "COMPLETE" ||
    s === "COMPLETED" ||
    s === "PAID" ||
    s === "APPROVED" ||
    s === "CONFIRMED"
  );
}

async function tryDeliverIfGgPixPaid(
  orderId: string,
  apiKey: string,
  chargeId: string | null,
  txid: string | null,
): Promise<boolean> {
  const refs = [...new Set([chargeId, txid].filter((v): v is string => Boolean(v?.trim())))];
  for (const ref of refs) {
    try {
      const remote = await fetchGgPixTransactionById(ref, apiKey);
      const st = remote?.status?.toUpperCase() ?? "";
      if (isGgPixPaidStatus(st)) {
        await deliverActivationCode(orderId);
        return true;
      }
    } catch {
      /* continua próximo ref */
    }
  }
  return false;
}

async function tryDeliverIfWooviPaid(
  orderId: string,
  apiKey: string,
  tryIds: string[],
): Promise<boolean> {
  const ids = [...new Set(tryIds.filter((v) => v?.trim()))];
  for (const ref of ids) {
    try {
      const remoteStatus = await fetchWooviChargeStatus(ref, apiKey);
      if (remoteStatus && isWooviChargePaidStatus(remoteStatus)) {
        await deliverActivationCode(orderId);
        return true;
      }
    } catch {
      /* próximo id */
    }
  }
  return false;
}

/**
 * Consulta o gateway para pedidos Pix ainda pendentes e entrega se já pago.
 * Não depende do cliente manter o checkout aberto nem do webhook ter chegado.
 */
export async function reconcilePendingPixOrders(): Promise<{
  checked: number;
  delivered: number;
  skipped: number;
}> {
  const settings = await getPaymentGatewaySettings();
  const since = new Date(Date.now() - PENDING_MAX_AGE_HOURS * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      status: "pending",
      createdAt: { gte: since },
      OR: [
        { wooviChargeId: { not: null } },
        { wooviTxid: { not: null } },
        { pixCorrelationId: { not: null } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: MAX_ORDERS_PER_RUN,
    select: {
      id: true,
      wooviChargeId: true,
      wooviTxid: true,
      pixCorrelationId: true,
    },
  });

  let delivered = 0;

  if (settings.paymentProvider === "ggpix") {
    const apiKey = settings.ggpixApiKey || process.env.GGPIX_API_KEY || "";
    if (!apiKey.trim()) {
      return { checked: orders.length, delivered: 0, skipped: orders.length };
    }
    for (const o of orders) {
      try {
        const ok = await tryDeliverIfGgPixPaid(o.id, apiKey, o.wooviChargeId, o.wooviTxid);
        if (ok) delivered += 1;
      } catch (e) {
        console.error("[reconcile-pix] ggpix order", o.id, e);
      }
    }
    return {
      checked: orders.length,
      delivered,
      skipped: orders.length - delivered,
    };
  }

  if (settings.paymentProvider === "woovi") {
    const apiKey = settings.wooviApiKey || process.env.WOOVI_API_KEY || "";
    if (!apiKey.trim()) {
      return { checked: orders.length, delivered: 0, skipped: orders.length };
    }
    for (const o of orders) {
      const tryIds = [o.wooviChargeId, o.wooviTxid, o.pixCorrelationId].filter(
        (v): v is string => Boolean(v?.trim()),
      );
      if (tryIds.length === 0) continue;
      try {
        const ok = await tryDeliverIfWooviPaid(o.id, apiKey, tryIds);
        if (ok) delivered += 1;
      } catch (e) {
        console.error("[reconcile-pix] woovi order", o.id, e);
      }
    }
    return {
      checked: orders.length,
      delivered,
      skipped: orders.length - delivered,
    };
  }

  return { checked: 0, delivered: 0, skipped: 0 };
}
