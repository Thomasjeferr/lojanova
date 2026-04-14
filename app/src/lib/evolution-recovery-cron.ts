import { prisma } from "@/lib/prisma";
import { brazilPhoneToE164 } from "@/lib/phone-e164";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import { displayOrderNumber } from "@/lib/order-ref";
import {
  evolutionFetchConnectionState,
  evolutionSendText,
  isEvolutionEnvConfigured,
} from "@/lib/evolution-api";
import {
  DEFAULT_EVOLUTION_RECOVERY_TEMPLATE,
  renderEvolutionTemplate,
} from "@/lib/evolution-messages";

const MIN_MINUTES = 15;
const MAX_MINUTES = 7 * 24 * 60;
const BATCH = 40;

export type EvolutionRecoveryCronResult = {
  checked: number;
  sent: number;
};

export async function runEvolutionRecoveryJob(): Promise<EvolutionRecoveryCronResult> {
  if (!isEvolutionEnvConfigured()) {
    return { checked: 0, sent: 0 };
  }

  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
    select: {
      evolutionRecoveryEnabled: true,
      evolutionInstanceName: true,
      evolutionRecoveryTemplate: true,
      evolutionRecoveryAfterMinutes: true,
    },
  });

  if (
    !settings?.evolutionRecoveryEnabled ||
    !settings.evolutionInstanceName?.trim()
  ) {
    return { checked: 0, sent: 0 };
  }

  const instanceName = settings.evolutionInstanceName.trim();
  const state = await evolutionFetchConnectionState(instanceName);
  if (state?.toLowerCase() !== "open") {
    return { checked: 0, sent: 0 };
  }

  let minutes = settings.evolutionRecoveryAfterMinutes ?? 60;
  if (!Number.isFinite(minutes)) minutes = 60;
  minutes = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, minutes));

  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      status: "pending",
      evolutionRecoverySentAt: null,
      createdAt: { lte: cutoff },
    },
    take: BATCH,
    orderBy: { createdAt: "asc" },
    include: { user: true, plan: true },
  });

  const branding = await prisma.siteBranding.findUnique({
    where: { id: "default" },
    select: { storeDisplayName: true },
  });
  const storeName =
    branding?.storeDisplayName?.trim() ||
    process.env.EMAIL_STORE_NAME?.trim() ||
    "Loja";

  const accountUrl = getPublicSiteBaseUrl();
  const template =
    settings.evolutionRecoveryTemplate?.trim() || DEFAULT_EVOLUTION_RECOVERY_TEMPLATE;

  let sent = 0;
  for (const order of orders) {
    const e164 = brazilPhoneToE164(order.user.phone);
    if (!e164) continue;

    const reserved = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: "pending",
        evolutionRecoverySentAt: null,
      },
      data: { evolutionRecoverySentAt: new Date() },
    });
    if (reserved.count === 0) continue;

    try {
      const firstName = order.user.name.trim().split(/\s+/)[0] || "Cliente";
      const body = renderEvolutionTemplate(template, {
        firstName,
        storeName,
        orderNumber: displayOrderNumber(order.orderNumber),
        planName: order.plan.title,
        accountUrl,
      });
      await evolutionSendText(instanceName, e164.replace(/\D/g, ""), body);
      sent += 1;
    } catch (e) {
      console.error("[evolution] recovery send failed", order.id, e);
      await prisma.order.update({
        where: { id: order.id },
        data: { evolutionRecoverySentAt: null },
      });
    }
  }

  return { checked: orders.length, sent };
}
