import twlib from "twilio";
import { brazilPhoneToE164 } from "@/lib/phone-e164";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import { prisma } from "@/lib/prisma";

const DEFAULT_STORE = "Loja Digital";

function twilioEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  const from = process.env.TWILIO_SMS_FROM?.trim();
  return { accountSid, authToken, messagingServiceSid, from };
}

function buildActivationSmsBody(input: {
  storeName: string;
  name: string;
  planName: string;
  credentialLabel: string;
  credentialValue: string;
  accountUrl: string;
}): string {
  const first = input.name.trim().split(/\s+/)[0] || "Cliente";
  return `${input.storeName}: Ola ${first}! Pagamento confirmado. Plano: ${input.planName}. ${input.credentialLabel}: ${input.credentialValue}. Detalhes: ${input.accountUrl}/account`;
}

/**
 * SMS após pagamento confirmado; não lança — falha só em log (como o e-mail).
 */
export async function sendActivationSms(input: {
  phone: string | null | undefined;
  name: string;
  planName: string;
  credentialLabel: string;
  credentialValue: string;
}): Promise<void> {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
    select: { smsDeliveryEnabled: true },
  });
  if (settings && settings.smsDeliveryEnabled === false) {
    return;
  }

  const { accountSid, authToken, messagingServiceSid, from } = twilioEnv();
  if (!accountSid || !authToken || (!messagingServiceSid && !from)) {
    return;
  }

  const to = brazilPhoneToE164(input.phone);
  if (!to) {
    console.warn("[sms] Telefone invalido ou ausente; SMS nao enviado.");
    return;
  }

  const storeName = process.env.EMAIL_STORE_NAME?.trim() || DEFAULT_STORE;
  const appUrl = getPublicSiteBaseUrl();
  const body = buildActivationSmsBody({
    storeName,
    name: input.name,
    planName: input.planName,
    credentialLabel: input.credentialLabel,
    credentialValue: input.credentialValue,
    accountUrl: appUrl,
  });

  try {
    const client = twlib(accountSid, authToken);
    await client.messages.create({
      to,
      body,
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: from! }),
    });
  } catch (error) {
    console.error("[sms] Falha ao enviar SMS de ativacao:", error);
  }
}
