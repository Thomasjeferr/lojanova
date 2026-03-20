import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { adminActivationCodePatchSchema } from "@/lib/validators";

async function loadEditableCode(id: string) {
  return prisma.activationCode.findFirst({
    where: { id },
    include: { _count: { select: { deliveries: true } } },
  });
}

function assertCanMutate(code: NonNullable<Awaited<ReturnType<typeof loadEditableCode>>>) {
  if (code.status === "sold" || code.orderId !== null || code._count.deliveries > 0) {
    return "Códigos vendidos ou já vinculados a um pedido não podem ser alterados ou excluídos.";
  }
  return null;
}

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const code = await loadEditableCode(id);
    if (!code) return badRequest("Código não encontrado.");
    const block = assertCanMutate(code);
    if (block) return badRequest(block);

    const parsed = adminActivationCodePatchSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Dados inválidos", parsed.error.flatten());
    const body = parsed.data;

    const data: {
      planId?: string;
      code?: string;
      username?: string | null;
      password?: string | null;
    } = {};

    if (body.planId !== undefined && body.planId !== code.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
      if (!plan) return badRequest("Plano não encontrado.");
      data.planId = body.planId;
    }

    if (code.credentialType === "activation_code") {
      if (body.username !== undefined || body.password !== undefined) {
        return badRequest("Para tipo código, use apenas o campo de código.");
      }
      if (body.code !== undefined && body.code.trim() !== "") {
        const only = body.code.replace(/\s+/g, "");
        if (!/^[A-Za-z0-9]{16}$/.test(only)) {
          return badRequest("Código deve ter 16 caracteres alfanuméricos.");
        }
        const normalized = only.toUpperCase();
        if (normalized !== code.code) {
          const conflict = await prisma.activationCode.findFirst({
            where: { code: normalized, id: { not: id } },
          });
          if (conflict) return badRequest("Já existe um código igual no estoque.");
        }
        data.code = normalized;
      }
    } else {
      if (body.code !== undefined && body.code.trim() !== "") {
        return badRequest("Para usuário/senha, edite usuário e senha (não o código interno).");
      }
      if (body.username !== undefined && body.password !== undefined) {
        const newInternalCode = `UP:${body.username}#${body.password}`;
        if (newInternalCode !== code.code) {
          const conflict = await prisma.activationCode.findFirst({
            where: { code: newInternalCode, id: { not: id } },
          });
          if (conflict) return badRequest("Esta combinação usuário/senha já existe no estoque.");
        }
        data.code = newInternalCode;
        data.username = body.username;
        data.password = body.password;
      }
    }

    if (Object.keys(data).length === 0) {
      return badRequest("Nada para atualizar.");
    }

    const updated = await prisma.activationCode.update({
      where: { id },
      data,
      include: { plan: true, order: { include: { user: { select: { email: true } } } } },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.userId,
        action: "update_activation_code",
        resource: id,
        metadata: { fields: Object.keys(data) },
      },
    });

    return ok({ code: updated });
  } catch (e) {
    if (e instanceof Error && e.message === "Acesso negado") {
      return forbidden();
    }
    if (e instanceof Error && e.message === "Não autenticado") {
      return forbidden();
    }
    return forbidden();
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const code = await loadEditableCode(id);
    if (!code) return badRequest("Código não encontrado.");
    const block = assertCanMutate(code);
    if (block) return badRequest(block);

    await prisma.activationCode.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: admin.userId,
        action: "delete_activation_code",
        resource: id,
        metadata: { planId: code.planId, credentialType: code.credentialType },
      },
    });

    return ok({ message: "Código excluído." });
  } catch (e) {
    if (e instanceof Error && (e.message === "Acesso negado" || e.message === "Não autenticado")) {
      return forbidden();
    }
    return forbidden();
  }
}
