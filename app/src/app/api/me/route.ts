import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, phone: true },
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
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone || null },
      select: { id: true, name: true, email: true, phone: true },
    });
    return ok(user);
  } catch {
    return unauthorized();
  }
}
