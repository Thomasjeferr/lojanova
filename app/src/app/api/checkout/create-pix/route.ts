import { prisma } from "@/lib/prisma";
import { badRequest, ok, unauthorized } from "@/lib/http";
import { createPixSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { createPixChargeByActiveProvider } from "@/lib/payment-gateway";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";
import {
  ensurePixReservationForOrder,
  releasePixReservationForOrder,
} from "@/lib/pix-reservation";

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
    if (order.status === "cancelled") {
      return badRequest("Pedido cancelado. Crie um novo pedido para pagar.");
    }
    if (order.status === "failed") {
      return badRequest("Pedido indisponível para pagamento. Crie um novo pedido.");
    }
    if (order.status !== "pending") {
      return badRequest("Este pedido não está pendente para geração de Pix.");
    }

    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true, planId: true },
      });
      if (!fresh) {
        throw new Error("Pedido não encontrado");
      }
      if (fresh.status !== "pending") {
        throw new Error("Este pedido não está mais pendente para pagamento.");
      }
      await ensurePixReservationForOrder(tx, { id: order.id, planId: order.planId });
    });

    let pix: Awaited<ReturnType<typeof createPixChargeByActiveProvider>>;
    try {
      pix = await createPixChargeByActiveProvider({
        amountCents: order.amountCents,
        payerName: order.user.name,
        externalId: order.id,
        payerDocument: parsed.data.payerDocument,
        payerEmail: order.user.email,
        payerPhone: order.user.phone,
      });
    } catch (chargeErr) {
      await releasePixReservationForOrder(order.id).catch(() => {
        /* não bloquear resposta de erro */
      });
      throw chargeErr;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        wooviChargeId: pix.chargeId || null,
        wooviTxid: pix.txid || null,
        pixCorrelationId: pix.correlationID ?? null,
      },
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
