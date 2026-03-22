import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type LandingUserSession = {
  email: string;
  /** CPF salvo (11 dígitos) para pré-preencher checkout; null se nunca informado. */
  payerCpf: string | null;
};

/** Dados públicos mínimos do usuário logado para landing/checkout (sem expor token). */
export async function getLandingUserSession(): Promise<LandingUserSession | null> {
  try {
    const auth = await getAuthUser();
    if (!auth?.userId) return null;
    const row = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, payerCpf: true },
    });
    if (!row) return null;
    return {
      email: row.email,
      payerCpf: row.payerCpf?.trim() || null,
    };
  } catch {
    return null;
  }
}
