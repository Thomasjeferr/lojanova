import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/http";
import { hashPassword, createSessionCookies } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest("Dados inválidos", parsed.error.flatten());
  }

  const data = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return badRequest("Já existe uma conta com este e-mail");
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      passwordHash: await hashPassword(data.password),
      isAdmin: false,
    },
  });

  await createSessionCookies({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  await sendWelcomeEmail({
    to: user.email,
    name: user.name,
  });

  return ok({
    message: "Conta criada com sucesso",
    user: { id: user.id, name: user.name, email: user.email },
  });
}
