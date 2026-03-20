import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { renderCredentialLine } from "@/lib/activation-credentials";

export async function GET() {
  try {
    const auth = await requireUser();
    const access = await prisma.delivery.findMany({
      where: { order: { userId: auth.userId } },
      include: {
        order: { include: { plan: true } },
        activationCode: true,
      },
      orderBy: { deliveredAt: "desc" },
    });

    return ok({
      access: access.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        planTitle: item.order.plan.title,
        durationDays: item.order.plan.durationDays,
        code: renderCredentialLine({
          credentialType: item.activationCode.credentialType,
          code: item.activationCode.code,
          username: item.activationCode.username,
          password: item.activationCode.password,
        }),
        credentialType: item.activationCode.credentialType,
        deliveredAt: item.deliveredAt,
      })),
    });
  } catch {
    return unauthorized();
  }
}
