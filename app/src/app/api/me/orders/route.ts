import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { renderCredentialLine } from "@/lib/activation-credentials";

export async function GET() {
  try {
    const auth = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: auth.userId },
      include: {
        plan: true,
        activationCode: { select: { code: true, status: true, credentialType: true, username: true, password: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      orders: orders.map((o) => ({
        ...o,
        activationCode: o.activationCode
          ? {
              ...o.activationCode,
              code: renderCredentialLine({
                credentialType: o.activationCode.credentialType,
                code: o.activationCode.code,
                username: o.activationCode.username,
                password: o.activationCode.password,
              }),
            }
          : null,
      })),
    });
  } catch {
    return unauthorized();
  }
}
