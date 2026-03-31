import { prisma } from "@/lib/prisma";
import type { PaymentProvider } from "@prisma/client";

export type WooviSettings = {
  wooviApiKey: string;
  wooviWebhookSecret: string;
};

export type PaymentGatewaySettings = WooviSettings & {
  paymentProvider: PaymentProvider;
  ggpixApiKey: string;
  ggpixWebhookSecret: string;
  ggpixWebhookBearer: string;
};

export const WOOVI_FALLBACK: WooviSettings = {
  wooviApiKey: process.env.WOOVI_API_KEY?.trim() || "",
  wooviWebhookSecret: process.env.WOOVI_WEBHOOK_SECRET?.trim() || "",
};

export const PAYMENT_GATEWAY_FALLBACK: PaymentGatewaySettings = {
  paymentProvider: "woovi",
  wooviApiKey: WOOVI_FALLBACK.wooviApiKey,
  wooviWebhookSecret: WOOVI_FALLBACK.wooviWebhookSecret,
  ggpixApiKey: process.env.GGPIX_API_KEY?.trim() || "",
  ggpixWebhookSecret: process.env.GGPIX_WEBHOOK_SECRET?.trim() || "",
  ggpixWebhookBearer: process.env.GGPIX_WEBHOOK_BEARER?.trim() || "",
};

export async function getPaymentGatewaySettings(): Promise<PaymentGatewaySettings> {
  try {
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        paymentProvider: true,
        wooviApiKey: true,
        wooviWebhookSecret: true,
        ggpixApiKey: true,
        ggpixWebhookSecret: true,
        ggpixWebhookBearer: true,
      },
    });
    return {
      paymentProvider: row?.paymentProvider || PAYMENT_GATEWAY_FALLBACK.paymentProvider,
      wooviApiKey: row?.wooviApiKey?.trim() || PAYMENT_GATEWAY_FALLBACK.wooviApiKey,
      wooviWebhookSecret:
        row?.wooviWebhookSecret?.trim() || PAYMENT_GATEWAY_FALLBACK.wooviWebhookSecret,
      ggpixApiKey: row?.ggpixApiKey?.trim() || PAYMENT_GATEWAY_FALLBACK.ggpixApiKey,
      ggpixWebhookSecret:
        row?.ggpixWebhookSecret?.trim() || PAYMENT_GATEWAY_FALLBACK.ggpixWebhookSecret,
      ggpixWebhookBearer:
        row?.ggpixWebhookBearer?.trim() || PAYMENT_GATEWAY_FALLBACK.ggpixWebhookBearer,
    };
  } catch {
    return PAYMENT_GATEWAY_FALLBACK;
  }
}

export async function getWooviSettings(): Promise<WooviSettings> {
  const settings = await getPaymentGatewaySettings();
  return {
    wooviApiKey: settings.wooviApiKey,
    wooviWebhookSecret: settings.wooviWebhookSecret,
  };
}
