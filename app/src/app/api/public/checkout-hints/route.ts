import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";

/**
 * Dicas de checkout sem expor segredos: CPF no Pix (GGPIX) e canais de envio da credencial (SMS / WhatsApp Evolution).
 */
export async function GET() {
  const fallback = {
    requiresPayerCpf: true,
    credentialSmsEnabled: true,
    credentialWhatsAppEnabled: false,
  };

  try {
    const s = await getPaymentGatewaySettings();
    const requiresPayerCpf = s.paymentProvider === "ggpix";

    let credentialSmsEnabled = true;
    let credentialWhatsAppEnabled = false;

    try {
      const row = await prisma.appSettings.findUnique({
        where: { id: "default" },
        select: {
          smsDeliveryEnabled: true,
          evolutionDeliveryEnabled: true,
        },
      });
      if (row) {
        credentialSmsEnabled = row.smsDeliveryEnabled ?? true;
        credentialWhatsAppEnabled = row.evolutionDeliveryEnabled ?? false;
      }
    } catch (e) {
      if (
        !(e instanceof Prisma.PrismaClientKnownRequestError &&
          (e.code === "P2021" || e.code === "P2022"))
      ) {
        throw e;
      }
    }

    return NextResponse.json({
      requiresPayerCpf,
      credentialSmsEnabled,
      credentialWhatsAppEnabled,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
