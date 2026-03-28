import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { contactSettingsSchema } from "@/lib/validators";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { toPublicContactSettings, CONTACT_FALLBACK } from "@/lib/contact-settings";

export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });
    return ok({
      settings: row
        ? {
            whatsappEnabled: row.whatsappEnabled,
            whatsappNumber: row.whatsappNumber || "",
            whatsappMessage: row.whatsappMessage || CONTACT_FALLBACK.whatsappMessage,
            whatsappLabel: row.whatsappLabel || CONTACT_FALLBACK.whatsappLabel,
            whatsappDeliveryEnabled: row.whatsappDeliveryEnabled ?? false,
            whatsappDeliveryTemplate: row.whatsappDeliveryTemplate || "",
            previewLink: toPublicContactSettings(row).whatsappLink,
          }
        : {
            ...CONTACT_FALLBACK,
            whatsappDeliveryEnabled: false,
            whatsappDeliveryTemplate: "",
            previewLink: "",
          },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
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
    const parsed = contactSettingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const body = parsed.data;
    const normalizedNumber = normalizeWhatsAppNumber(body.whatsappNumber || "");

    const row = await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        whatsappEnabled: body.whatsappEnabled,
        whatsappNumber: normalizedNumber || null,
        whatsappMessage: (body.whatsappMessage || CONTACT_FALLBACK.whatsappMessage).trim(),
        whatsappLabel: (body.whatsappLabel || CONTACT_FALLBACK.whatsappLabel).trim(),
        whatsappDeliveryEnabled: body.whatsappDeliveryEnabled ?? false,
        whatsappDeliveryTemplate: (body.whatsappDeliveryTemplate || "").trim() || null,
      },
      update: {
        whatsappEnabled: body.whatsappEnabled,
        whatsappNumber: normalizedNumber || null,
        whatsappMessage: (body.whatsappMessage || CONTACT_FALLBACK.whatsappMessage).trim(),
        whatsappLabel: (body.whatsappLabel || CONTACT_FALLBACK.whatsappLabel).trim(),
        whatsappDeliveryEnabled: body.whatsappDeliveryEnabled ?? false,
        whatsappDeliveryTemplate: (body.whatsappDeliveryTemplate || "").trim() || null,
      },
    });

    return ok({
      message: "Configurações de WhatsApp salvas com sucesso.",
      settings: {
        whatsappEnabled: row.whatsappEnabled,
        whatsappNumber: row.whatsappNumber || "",
        whatsappMessage: row.whatsappMessage || CONTACT_FALLBACK.whatsappMessage,
        whatsappLabel: row.whatsappLabel || CONTACT_FALLBACK.whatsappLabel,
        whatsappDeliveryEnabled: row.whatsappDeliveryEnabled ?? false,
        whatsappDeliveryTemplate: row.whatsappDeliveryTemplate || "",
        previewLink: toPublicContactSettings(row).whatsappLink,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest('Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app.');
    }
    return forbidden();
  }
}

