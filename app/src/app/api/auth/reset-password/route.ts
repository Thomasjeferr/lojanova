import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/http";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordChangedEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rate = await checkRateLimit(`reset-password:${ip}`, 8, 60);
  if (!rate.success) {
    return badRequest("Muitas tentativas. Aguarde um minuto e tente novamente.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Dados inválidos", parsed.error.flatten());
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const now = new Date();
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!token) {
    return badRequest("Link inválido ou expirado. Solicite uma nova redefinição.");
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: token.userId, usedAt: null },
    }),
    prisma.session.deleteMany({
      where: { userId: token.userId },
    }),
  ]);

  await sendPasswordChangedEmail({
    to: token.user.email,
    name: token.user.name,
  });

  return ok({ message: "Senha redefinida com sucesso. Faça login novamente." });
}
