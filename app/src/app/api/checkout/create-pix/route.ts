import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { createPixSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { createPixChargeByActiveProvider } from "@/lib/payment-gateway";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";

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

    const pix = await createPixChargeByActiveProvider({
      amountCents: order.amountCents,
      payerName: order.user.name,
      externalId: order.id,
      payerDocument: parsed.data.payerDocument,
      payerEmail: order.user.email,
      payerPhone: order.user.phone,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { wooviChargeId: pix.chargeId, wooviTxid: pix.txid },
    });

    const docRaw = (parsed.data.payerDocument ?? "").trim();
    if (docRaw) {
      const d = normalizePayerDocument(docRaw);
      if (isValidPayerDocument(d)) {
        await prisma.user
          .update({
            where: { id: auth.userId },
            data: { payerCpf: d },
          })
          .catch(() => {
            /* não bloquear checkout */
          });
      }
    }

    return ok({
      message: "Cobrança Pix gerada",
      chargeId: pix.chargeId,
      txid: pix.txid,
      qrCodeImage: pix.qrCodeImage,
      brCode: pix.brCode,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Não autenticado") {
      return unauthorized();
    }
    console.error("[checkout/create-pix]", e);
    const msg =
      e instanceof Error && e.message.trim()
        ? e.message
        : "Não foi possível gerar o Pix. Tente novamente.";
    return badRequest(msg);
  }
}
