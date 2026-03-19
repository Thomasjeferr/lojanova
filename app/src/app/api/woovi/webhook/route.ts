import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { deliverActivationCode } from "@/lib/delivery";
import { ok, badRequest } from "@/lib/http";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WOOVI_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-woovi-signature");

  if (!isValidSignature(rawBody, signature)) {
    return badRequest("Assinatura de webhook inválida");
  }

  const payload = JSON.parse(rawBody);
  const eventId = payload.eventId || payload._id || payload.txid;
  const eventType = payload.type || "unknown";
  const txid = payload.txid || payload.charge?.txid;
  const paid = payload.status === "PAID" || payload.charge?.status === "COMPLETED";

  if (!eventId || !txid) {
    return badRequest("Payload de webhook inválido");
  }

  const existing = await prisma.webhookLog.findUnique({ where: { eventId } });
  if (existing?.processed) {
    return ok({ message: "Evento já processado" });
  }

  await prisma.webhookLog.upsert({
    where: { eventId },
    update: { payload, eventType },
    create: { eventId, eventType, payload, processed: false },
  });

  if (!paid) {
    return ok({ message: "Evento recebido, aguardando pagamento" });
  }

  const order = await prisma.order.findFirst({ where: { wooviTxid: txid } });
  if (!order) {
    return badRequest("Pedido não encontrado para txid");
  }

  if (order.status !== "paid") {
    await deliverActivationCode(order.id);
  }

  await prisma.webhookLog.update({
    where: { eventId },
    data: { processed: true },
  });

  return ok({ message: "Pagamento confirmado e código entregue" });
}
