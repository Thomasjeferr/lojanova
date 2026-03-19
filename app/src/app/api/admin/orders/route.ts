import { prisma } from "@/lib/prisma";
import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        plan: true,
        activationCode: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders });
  } catch {
    return forbidden();
  }
}
