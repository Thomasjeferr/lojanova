import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const planSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
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
