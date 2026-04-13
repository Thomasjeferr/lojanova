import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

const STATUS_SET = new Set(["available", "reserved", "sold", "blocked"]);

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function parsePageSize(raw: string | null): number {
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, n));
}

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const planId = url.searchParams.get("planId");
    const qRaw = url.searchParams.get("q")?.trim().slice(0, 120) ?? "";
    const pageSize = parsePageSize(url.searchParams.get("limit"));
    const page = parsePage(url.searchParams.get("page"));

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

    const whereClause =
      Object.keys(where).length > 0 ? where : undefined;
    const skip = (page - 1) * pageSize;

    const [codes, total] = await Promise.all([
      prisma.activationCode.findMany({
        where: whereClause,
        include: {
          plan: true,
          order: {
            include: { user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.activationCode.count({ where: whereClause }),
    ]);

    return ok({ codes, total, page, pageSize });
  } catch {
    return forbidden();
  }
}
