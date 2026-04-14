import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { evolutionCreateInstance, isEvolutionEnvConfigured } from "@/lib/evolution-api";

export async function POST() {
  try {
    await requireAdmin();

    if (!isEvolutionEnvConfigured()) {
      return badRequest(
        "Configure EVOLUTION_API_URL e EVOLUTION_API_KEY na Vercel (ou .env local).",
      );
    }

    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: { evolutionInstanceName: true },
    });
    if (row?.evolutionInstanceName?.trim()) {
      return badRequest(
        "Já existe uma instância nesta loja. Use \"Exibir QR\" para parear ou gerencie o nome na Evolution.",
      );
    }

    const suffix = randomBytes(6).toString("hex");
    const instanceName = `loja-${suffix}`;

    await evolutionCreateInstance(instanceName);

    await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        evolutionInstanceName: instanceName,
        evolutionConnectionState: "created",
      },
      update: {
        evolutionInstanceName: instanceName,
        evolutionConnectionState: "created",
      },
    });

    return ok({ instanceName, message: "Instância criada. Abra o QR para parear o WhatsApp." });
  } catch (e) {
    if (e instanceof Error && (e.message === "Não autenticado" || e.message === "Acesso negado")) {
      return forbidden();
    }
    if (e instanceof Error && e.message.startsWith("Evolution ")) {
      return badRequest(e.message);
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest('Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app.');
    }
    console.error("[admin/evolution/instance]", e);
    return badRequest(
      e instanceof Error && e.message ? e.message : "Não foi possível criar a instância.",
    );
  }
}
