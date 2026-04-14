import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { forbidden, ok, badRequest } from "@/lib/http";
import {
  evolutionFetchConnectionState,
  isEvolutionEnvConfigured,
} from "@/lib/evolution-api";

export async function GET() {
  try {
    await requireAdmin();
    const envConfigured = isEvolutionEnvConfigured();
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        evolutionInstanceName: true,
        evolutionConnectionState: true,
      },
    });

    const name = row?.evolutionInstanceName?.trim() ?? "";
    let connectionState = row?.evolutionConnectionState ?? null;

    if (envConfigured && name) {
      try {
        const live = await evolutionFetchConnectionState(name);
        if (live) {
          connectionState = live;
          await prisma.appSettings.update({
            where: { id: "default" },
            data: { evolutionConnectionState: live },
          });
        }
      } catch {
        /* mantém último estado gravado */
      }
    }

    return ok({
      envConfigured,
      instanceName: name || null,
      connectionState,
    });
  } catch (e) {
    if (e instanceof Error && (e.message === "Não autenticado" || e.message === "Acesso negado")) {
      return forbidden();
    }
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
