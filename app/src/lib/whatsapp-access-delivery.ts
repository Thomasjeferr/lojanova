import { prisma } from "@/lib/prisma";
import { brazilPhoneToE164 } from "@/lib/phone-e164";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import {
  evolutionFetchConnectionState,
  evolutionSendText,
  isEvolutionEnvConfigured,
} from "@/lib/evolution-api";
import {
  DEFAULT_EVOLUTION_DELIVERY_TEMPLATE,
  renderEvolutionTemplate,
} from "@/lib/evolution-messages";
import { formatPlanAccessValidityShort } from "@/lib/plan-validity";

/**
 * Entrega da credencial por WhatsApp (Evolution API na VPS).
 * Não lança — falhas só em log (como e-mail/SMS).
 */
export async function sendActivationWhatsApp(input: {
  phone: string | null | undefined;
  name: string;
  planName: string;
  durationDays: number;
  credentialLabel: string;
  credentialValue: string;
}): Promise<void> {
  try {
    if (!isEvolutionEnvConfigured()) return;

    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        evolutionDeliveryEnabled: true,
        evolutionInstanceName: true,
        evolutionDeliveryTemplate: true,
      },
    });

    if (
      !settings?.evolutionDeliveryEnabled ||
      !settings.evolutionInstanceName?.trim()
    ) {
      return;
    }

    const instanceName = settings.evolutionInstanceName.trim();
    const state = await evolutionFetchConnectionState(instanceName);
    if (state?.toLowerCase() !== "open") {
      return;
    }

    const e164 = brazilPhoneToE164(input.phone);
    if (!e164) return;

    const branding = await prisma.siteBranding.findUnique({
      where: { id: "default" },
      select: { storeDisplayName: true },
    });
    const storeName =
      branding?.storeDisplayName?.trim() ||
      process.env.EMAIL_STORE_NAME?.trim() ||
      "Loja";

    const firstName = input.name.trim().split(/\s+/)[0] || "Cliente";
    const accountUrl = getPublicSiteBaseUrl();
    const template =
      settings.evolutionDeliveryTemplate?.trim() || DEFAULT_EVOLUTION_DELIVERY_TEMPLATE;

    const validityLabel = formatPlanAccessValidityShort(input.durationDays);
    const body = renderEvolutionTemplate(template, {
      firstName,
      storeName,
      planName: input.planName,
      validityLabel,
      credentialLabel: input.credentialLabel,
      credentialValue: input.credentialValue,
      accountUrl,
    });

    await evolutionSendText(instanceName, e164.replace(/\D/g, ""), body);
  } catch (e) {
    console.error("[evolution] Falha ao enviar WhatsApp de ativacao:", e);
  }
}
