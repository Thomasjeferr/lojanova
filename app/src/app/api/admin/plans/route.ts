import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const planSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  logoDataUrl: z
    .union([
      z
        .string()
        .regex(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i, "Use PNG, JPG, WebP ou GIF")
        .max(2_500_000, "Logo muito grande"),
      z.null(),
    ])
    .optional(),
  durationDays: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  benefits: z.array(z.string().min(2)).min(1),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function GET() {
  try {
    await requireAdmin();
    const plans = await prisma.plan.findMany({ orderBy: { durationDays: "asc" } });
    return ok({ plans });
  } catch {
    return forbidden();
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = planSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Dados inválidos", parsed.error.flatten());

    const plan = parsed.data.id
      ? await prisma.plan.update({ where: { id: parsed.data.id }, data: parsed.data })
      : await prisma.plan.create({ data: parsed.data });

    return ok({ message: "Plano salvo com sucesso", plan });
  } catch {
    return forbidden();
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    if (!id) return badRequest("ID do plano é obrigatório.");

    await prisma.plan.delete({ where: { id } });
    return ok({ message: "Plano excluído com sucesso." });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return badRequest("Plano não encontrado.");
      if (e.code === "P2003") {
        return badRequest("Não é possível excluir este plano pois já existem pedidos vinculados.");
      }
    }
    return forbidden();
  }
}
