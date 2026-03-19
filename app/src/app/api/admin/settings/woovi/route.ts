import { PaymentProvider, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { wooviSettingsSchema } from "@/lib/validators";
import { PAYMENT_GATEWAY_FALLBACK } from "@/lib/woovi-settings";

export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        paymentProvider: true,
        wooviApiKey: true,
        wooviWebhookSecret: true,
        ggpixApiKey: true,
        ggpixWebhookSecret: true,
      },
    });
    return ok({
      settings: {
        paymentProvider: row?.paymentProvider || PAYMENT_GATEWAY_FALLBACK.paymentProvider,
        wooviApiKey: row?.wooviApiKey || PAYMENT_GATEWAY_FALLBACK.wooviApiKey,
        wooviWebhookSecret:
          row?.wooviWebhookSecret || PAYMENT_GATEWAY_FALLBACK.wooviWebhookSecret,
        ggpixApiKey: row?.ggpixApiKey || PAYMENT_GATEWAY_FALLBACK.ggpixApiKey,
        ggpixWebhookSecret:
          row?.ggpixWebhookSecret || PAYMENT_GATEWAY_FALLBACK.ggpixWebhookSecret,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return badRequest(
        'Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app e reinicie o servidor.',
      );
    }
    return forbidden();
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const parsed = wooviSettingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const body = parsed.data;

    const row = await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        paymentProvider:
          body.paymentProvider === "ggpix" ? PaymentProvider.ggpix : PaymentProvider.woovi,
        wooviApiKey: (body.wooviApiKey || "").trim() || null,
        wooviWebhookSecret: (body.wooviWebhookSecret || "").trim() || null,
        ggpixApiKey: (body.ggpixApiKey || "").trim() || null,
        ggpixWebhookSecret: (body.ggpixWebhookSecret || "").trim() || null,
      },
      update: {
        paymentProvider:
          body.paymentProvider === "ggpix" ? PaymentProvider.ggpix : PaymentProvider.woovi,
        wooviApiKey: (body.wooviApiKey || "").trim() || null,
        wooviWebhookSecret: (body.wooviWebhookSecret || "").trim() || null,
        ggpixApiKey: (body.ggpixApiKey || "").trim() || null,
        ggpixWebhookSecret: (body.ggpixWebhookSecret || "").trim() || null,
      },
    });

    return ok({
      message: "Configurações de gateway salvas com sucesso.",
      settings: {
        paymentProvider: row.paymentProvider,
        wooviApiKey: row.wooviApiKey || "",
        wooviWebhookSecret: row.wooviWebhookSecret || "",
        ggpixApiKey: row.ggpixApiKey || "",
        ggpixWebhookSecret: row.ggpixWebhookSecret || "",
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return badRequest('Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app.');
    }
    return forbidden();
  }
}
