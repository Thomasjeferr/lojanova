import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/http";

/** Contagem pública de códigos disponíveis por plano ativo (sem listar credenciais). */
export async function GET() {
  try {
    const rows = await prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        _count: {
          select: {
            codes: { where: { status: "available" } },
          },
        },
      },
    });

    const stock: Record<string, number> = {};
    for (const r of rows) {
      stock[r.id] = r._count.codes;
    }

    return ok({ stock });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível consultar o estoque no momento." },
      { status: 503 },
    );
  }
}
