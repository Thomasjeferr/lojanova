import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { evolutionMessagingSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const parsed = evolutionMessagingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const b = parsed.data;

    const row = await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        evolutionDeliveryEnabled: b.evolutionDeliveryEnabled ?? false,
        evolutionDeliveryTemplate: (b.evolutionDeliveryTemplate || "").trim() || null,
        evolutionRecoveryEnabled: b.evolutionRecoveryEnabled ?? false,
        evolutionRecoveryTemplate: (b.evolutionRecoveryTemplate || "").trim() || null,
        evolutionRecoveryAfterMinutes: b.evolutionRecoveryAfterMinutes ?? 60,
      },
      update: {
        evolutionDeliveryEnabled: b.evolutionDeliveryEnabled ?? false,
        evolutionDeliveryTemplate: (b.evolutionDeliveryTemplate || "").trim() || null,
        evolutionRecoveryEnabled: b.evolutionRecoveryEnabled ?? false,
        evolutionRecoveryTemplate: (b.evolutionRecoveryTemplate || "").trim() || null,
        evolutionRecoveryAfterMinutes: b.evolutionRecoveryAfterMinutes ?? 60,
      },
    });

    return ok({
      message: "Configurações Evolution salvas.",
      settings: {
        evolutionDeliveryEnabled: row.evolutionDeliveryEnabled ?? false,
        evolutionDeliveryTemplate: row.evolutionDeliveryTemplate || "",
        evolutionRecoveryEnabled: row.evolutionRecoveryEnabled ?? false,
        evolutionRecoveryTemplate: row.evolutionRecoveryTemplate || "",
        evolutionRecoveryAfterMinutes: row.evolutionRecoveryAfterMinutes ?? 60,
      },
    });
  } catch (e) {
    if (e instanceof Error && (e.message === "Não autenticado" || e.message === "Acesso negado")) {
      return forbidden();
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest('Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app.');
    }
    return forbidden();
  }
}
