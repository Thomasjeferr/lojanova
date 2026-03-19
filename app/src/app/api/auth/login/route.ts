import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/http";
import { comparePassword, createSessionCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rate = await checkRateLimit(`login:${ip}`, 10, 60);
  if (!rate.success) {
    return badRequest("Muitas tentativas. Tente novamente em instantes.");
  }

  const json = await request.json();
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest("Dados inválidos", parsed.error.flatten());
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return badRequest("E-mail ou senha inválidos");
  }

  const isValid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return badRequest("E-mail ou senha inválidos");
  }

  await createSessionCookies({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  return ok({
    message: "Login realizado com sucesso",
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}
