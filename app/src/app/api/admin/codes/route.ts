import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

const STATUS_SET = new Set(["available", "reserved", "sold", "blocked"]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const planId = url.searchParams.get("planId");
    const qRaw = url.searchParams.get("q")?.trim().slice(0, 120) ?? "";

    const where: Prisma.ActivationCodeWhereInput = {};

    if (status && STATUS_SET.has(status)) {
      where.status = status as "available" | "reserved" | "sold" | "blocked";
    }
    if (planId) {
      where.planId = planId;
    }
    if (qRaw) {
      where.OR = [
        { username: { contains: qRaw, mode: "insensitive" } },
        { code: { contains: qRaw, mode: "insensitive" } },
        {
          order: {
            user: { email: { contains: qRaw, mode: "insensitive" } },
          },
        },
      ];
    }

    const codes = await prisma.activationCode.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
