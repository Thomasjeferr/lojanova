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
    const credentialType = parsed.data.credentialType;
    if (values.length === 0) return badRequest("Cole pelo menos uma linha válida.");

    const normalizedRows =
      credentialType === "activation_code"
        ? values.map((code) => {
            const only = code.replace(/\s+/g, "");
            if (!/^[A-Za-z0-9]{16}$/.test(only)) {
              throw new Error(
                `Formato inválido para código de ativação: "${code}". Use 16 caracteres alfanuméricos.`,
              );
            }
            return {
              code: only.toUpperCase(),
              credentialType,
              username: null,
              password: null,
            };
          })
        : values.map((line) => {
            const [rawUser = "", rawPass = ""] = line.split(/[;,|]/).map((v) => v.trim());
            if (!rawUser || !rawPass) {
              throw new Error(
                `Linha inválida para usuário/senha: "${line}". Use "usuario,senha" (ou ; / |).`,
              );
            }
            return {
              code: `UP:${rawUser}#${rawPass}`,
              credentialType,
              username: rawUser,
              password: rawPass,
            };
          });

    const uniqueRows = Array.from(
      new Map(normalizedRows.map((row) => [row.code.toLowerCase(), row])).values(),
    );
    const createMany = await prisma.activationCode.createMany({
      data: uniqueRows.map((row) => ({
        code: row.code,
        credentialType: row.credentialType,
        username: row.username,
        password: row.password,
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
        metadata: {
          planId: parsed.data.planId,
          total: values.length,
          importedUnique: uniqueRows.length,
          credentialType,
        },
      },
    });

    return ok({
      message: "Importação concluída",
      imported: createMany.count,
      totalSubmitted: values.length,
      totalUnique: uniqueRows.length,
      credentialType,
    });
  } catch (e) {
    if (e instanceof Error && e.message) {
      return badRequest(e.message);
    }
    return forbidden();
  }
}
