import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser, comparePassword, hashPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) return unauthorized();
    const valid = await comparePassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return badRequest("Senha atual incorreta");
    await prisma.user.update({
      where: { id: auth.userId },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });
    await sendPasswordChangedEmail({
      to: user.email,
      name: user.name,
    });
    return ok({ message: "Senha alterada com sucesso" });
  } catch {
    return unauthorized();
  }
}
