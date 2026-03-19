import { prisma } from "@/lib/prisma";
import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const planId = url.searchParams.get("planId");

    const codes = await prisma.activationCode.findMany({
      where: {
        status: status ? (status as "available" | "sold" | "blocked") : undefined,
        planId: planId || undefined,
      },
      include: {
        plan: true,
        order: {
          include: { user: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ codes });
  } catch {
    return forbidden();
  }
}
