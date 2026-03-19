import { prisma } from "@/lib/prisma";
import { deliverActivationCode } from "@/lib/delivery";
import { ok, badRequest } from "@/lib/http";
import { isValidWooviWebhookRequest } from "@/lib/webhook-signature";

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!process.env.WOOVI_WEBHOOK_SECRET?.trim()) {
    return badRequest("Webhook desabilitado: defina WOOVI_WEBHOOK_SECRET no ambiente");
  }

  if (!isValidWooviWebhookRequest(rawBody, request)) {
    return badRequest("Assinatura de webhook inválida");
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return badRequest("Payload JSON inválido");
  }

  const charge = payload.charge as Record<string, unknown> | undefined;
  const eventId = (payload.eventId ?? payload._id ?? payload.txid) as string | undefined;
  const eventType = (payload.type as string) || "unknown";
  const txid = (payload.txid ?? charge?.txid) as string | undefined;
  const paid =
    payload.status === "PAID" || charge?.status === "COMPLETED";

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
