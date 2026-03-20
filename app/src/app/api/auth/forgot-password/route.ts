import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/http";
import { forgotPasswordSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetRequestedEmail } from "@/lib/email";

const GENERIC_MESSAGE =
  "Se o e-mail existir, você receberá instruções para redefinir a senha em instantes.";

function appBaseUrl() {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rate = await checkRateLimit(`forgot-password:${ip}`, 5, 60);
  if (!rate.success) {
    return badRequest("Muitas tentativas. Aguarde um minuto e tente novamente.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Dados inválidos", parsed.error.flatten());
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return ok({ message: GENERIC_MESSAGE });
  }

  const tokenData = createPasswordResetToken();

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenData.tokenHash,
      expiresAt: tokenData.expiresAt,
    },
  });

  const resetUrl = `${appBaseUrl()}/redefinir-senha?token=${tokenData.rawToken}`;
  await sendPasswordResetRequestedEmail({
    to: user.email,
    name: user.name,
    resetUrl,
    expiresInMinutes: 30,
  });

  return ok({ message: GENERIC_MESSAGE });
}
