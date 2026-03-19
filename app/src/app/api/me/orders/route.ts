import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: {
        plan: true,
        activationCode: { select: { code: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders });
  } catch {
    return unauthorized();
  }
}
