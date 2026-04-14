import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { evolutionFetchConnect, isEvolutionEnvConfigured } from "@/lib/evolution-api";

export async function GET() {
  try {
    await requireAdmin();

    if (!isEvolutionEnvConfigured()) {
      return badRequest("Evolution não configurada (env).");
    }

    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: { evolutionInstanceName: true },
    });
    const name = row?.evolutionInstanceName?.trim();
    if (!name) {
      return badRequest("Crie uma instância antes de solicitar o QR code.");
    }

    const result = await evolutionFetchConnect(name);
    const connected = result.state?.toLowerCase() === "open";

    if (result.state) {
      await prisma.appSettings.update({
        where: { id: "default" },
        data: { evolutionConnectionState: result.state },
      });
    }

    return ok({
      connected,
      state: result.state,
      base64: result.base64,
      pairingCode: result.pairingCode,
    });
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
    console.error("[admin/evolution/connect]", e);
    return badRequest(
      e instanceof Error && e.message ? e.message : "Não foi possível obter o QR code.",
    );
  }
}
