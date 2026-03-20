import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { adminEmailTestSchema } from "@/lib/validators";
import { sendTestTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const parsed = adminEmailTestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Dados inválidos", parsed.error.flatten());
  }

  const { template, to } = parsed.data;
  const result = await sendTestTransactionalEmail(template, to);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return ok({
    sent: true,
    messageId: result.messageId ?? null,
    message: `E-mail de teste enviado para ${to}. Verifique a caixa de entrada e o spam.`,
  });
}
