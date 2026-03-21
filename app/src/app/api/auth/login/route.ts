import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/http";
import { comparePassword, createSessionCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordLoginActivity } from "@/lib/activity-log";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rate = await checkRateLimit(`login:${ip}`, 10, 60);
  if (!rate.success) {
    return badRequest("Muitas tentativas. Tente novamente em instantes.");
  }

  const json = await request.json();
  const body = {
    email: typeof json?.email === "string" ? json.email.trim() : "",
    password: typeof json?.password === "string" ? json.password.trim() : "",
  };
  const parsed = loginSchema.safeParse(body);
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

  after(() => recordLoginActivity(user.id, request));

  return ok({
    message: "Login realizado com sucesso",
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}
