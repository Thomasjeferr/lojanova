import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { importCodesSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const parsed = importCodesSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Dados inválidos", parsed.error.flatten());

    const values = parsed.data.codes.map((code) => code.trim()).filter(Boolean);
    const createMany = await prisma.activationCode.createMany({
      data: values.map((code) => ({
        code,
        planId: parsed.data.planId,
        status: "available",
      })),
      skipDuplicates: true,
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.userId,
        action: "import_codes",
        resource: "activation_code",
        metadata: { planId: parsed.data.planId, total: values.length },
      },
    });

    return ok({ message: "Importação concluída", imported: createMany.count });
  } catch {
    return forbidden();
  }
}
