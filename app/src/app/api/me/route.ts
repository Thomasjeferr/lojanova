import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";

export async function GET() {
  try {
    const auth = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, phone: true, payerCpf: true },
    });
    if (!user) return unauthorized();
    return ok(user);
  } catch {
    return unauthorized();
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser();
    const parsed = updateProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const data: { name: string; phone?: string | null; payerCpf?: string | null } = {
      name: parsed.data.name,
    };
    if (parsed.data.phone !== undefined) {
      data.phone = parsed.data.phone.trim() === "" ? null : parsed.data.phone;
    }
    if (parsed.data.payerCpf !== undefined) {
      const raw = parsed.data.payerCpf;
      const cpfNorm = normalizePayerDocument(raw);
      if (raw.trim() === "") {
        data.payerCpf = null;
      } else if (isValidPayerDocument(cpfNorm)) {
        data.payerCpf = cpfNorm;
      } else {
        return badRequest("CPF inválido");
      }
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data,
      select: { id: true, name: true, email: true, phone: true, payerCpf: true },
    });
    return ok(user);
  } catch {
    return unauthorized();
  }
}
