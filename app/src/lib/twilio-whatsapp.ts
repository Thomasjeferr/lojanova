import twlib from "twilio";
import { brazilPhoneToE164 } from "@/lib/phone-e164";
import { prisma } from "@/lib/prisma";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";

const DEFAULT_STORE = "Loja Digital";
const DEFAULT_TEMPLATE =
  "Olá {firstName}! Pagamento confirmado no {storeName}. Plano: {planName}. {credentialLabel}: {credentialValue}. Acompanhe em {accountUrl}/account";

function twilioEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  return { accountSid, authToken, from };
}

function renderTemplate(
  template: string,
  input: {
    firstName: string;
    storeName: string;
    planName: string;
    credentialLabel: string;
    credentialValue: string;
    accountUrl: string;
  },
): string {
  return template
    .replaceAll("{firstName}", input.firstName)
    .replaceAll("{storeName}", input.storeName)
    .replaceAll("{planName}", input.planName)
    .replaceAll("{credentialLabel}", input.credentialLabel)
    .replaceAll("{credentialValue}", input.credentialValue)
    .replaceAll("{accountUrl}", input.accountUrl);
}

/**
 * WhatsApp via Twilio após pagamento confirmado.
 * Não lança erro para não quebrar o fluxo principal de entrega.
 */
export async function sendActivationWhatsApp(input: {
  phone: string | null | undefined;
  name: string;
  planName: string;
  credentialLabel: string;
  credentialValue: string;
}): Promise<void> {
  const { accountSid, authToken, from } = twilioEnv();
  if (!accountSid || !authToken || !from) return;

  const toE164 = brazilPhoneToE164(input.phone);
  if (!toE164) return;

  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        whatsappDeliveryEnabled: true,
        whatsappDeliveryTemplate: true,
      },
    });
    if (!settings?.whatsappDeliveryEnabled) return;

    const firstName = input.name.trim().split(/\s+/)[0] || "Cliente";
    const storeName = process.env.EMAIL_STORE_NAME?.trim() || DEFAULT_STORE;
    const appUrl = getPublicSiteBaseUrl();
    const body = renderTemplate(
      settings.whatsappDeliveryTemplate?.trim() || DEFAULT_TEMPLATE,
      {
        firstName,
        storeName,
        planName: input.planName,
        credentialLabel: input.credentialLabel,
        credentialValue: input.credentialValue,
        accountUrl: appUrl,
      },
    );

    const client = twlib(accountSid, authToken);
    await client.messages.create({
      from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
      to: `whatsapp:${toE164}`,
      body,
    });
  } catch (error) {
    console.error("[whatsapp] Falha ao enviar WhatsApp de ativacao:", error);
  }
}
