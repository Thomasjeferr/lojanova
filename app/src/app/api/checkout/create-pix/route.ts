import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { createPixSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { createWooviPixCharge } from "@/lib/woovi";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    const parsed = createPixSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }

    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: auth.userId },
      include: { user: true },
    });
    if (!order) {
      return badRequest("Pedido não encontrado");
    }
    if (order.status === "paid") {
      return badRequest("Pedido já está pago");
    }

    const pix = await createWooviPixCharge({
      amountCents: order.amountCents,
      payerName: order.user.name,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { wooviChargeId: pix.chargeId, wooviTxid: pix.txid },
    });

    return ok({
      message: "Cobrança Pix gerada",
      chargeId: pix.chargeId,
      txid: pix.txid,
      qrCodeImage: pix.qrCodeImage,
      brCode: pix.brCode,
    });
  } catch {
    return unauthorized();
  }
}
