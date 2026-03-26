import { prisma } from "@/lib/prisma";
import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { renderCredentialLine } from "@/lib/activation-credentials";
import { buildSourceLabel } from "@/lib/attribution";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        plan: true,
        activationCode: {
          select: { code: true, status: true, credentialType: true, username: true, password: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      orders: orders.map((o) => ({
        ...o,
        activationCode: o.status === "paid" && o.activationCode?.status === "sold"
          ? {
              code: renderCredentialLine({
                credentialType: o.activationCode.credentialType,
                code: o.activationCode.code,
                username: o.activationCode.username,
                password: o.activationCode.password,
              }),
            }
          : null,
        attributionSourceLabel: buildSourceLabel(o.attributionSource, o.attributionMedium),
        attributionCampaign: o.attributionCampaign,
        attributionReferrer: o.attributionReferrer,
        attributionLandingPath: o.attributionLandingPath,
      })),
    });
  } catch {
    return forbidden();
  }
}
