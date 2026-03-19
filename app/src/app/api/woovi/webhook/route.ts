import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { deliverActivationCode } from "@/lib/delivery";
import { ok, badRequest } from "@/lib/http";
import { isValidWooviWebhookRequestWithSecret } from "@/lib/webhook-signature";
import { getWooviSettings } from "@/lib/woovi-settings";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const settings = await getWooviSettings();
  const webhookSecret = settings.wooviWebhookSecret || process.env.WOOVI_WEBHOOK_SECRET || "";

  if (!webhookSecret.trim()) {
    return badRequest(
      "Webhook desabilitado: configure o Webhook Secret da Woovi no admin ou no ambiente",
    );
  }

  if (!isValidWooviWebhookRequestWithSecret(rawBody, request, webhookSecret)) {
    return badRequest("Assinatura de webhook inválida");
  }

  let payloadRaw: unknown;
  try {
    payloadRaw = JSON.parse(rawBody);
  } catch {
    return badRequest("Payload JSON inválido");
  }

  if (!payloadRaw || typeof payloadRaw !== "object" || Array.isArray(payloadRaw)) {
    return badRequest("Payload JSON inválido");
  }

  const payload = payloadRaw as Record<string, unknown>;
  const payloadJson = payloadRaw as Prisma.InputJsonValue;
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
    update: { payload: payloadJson, eventType },
    create: { eventId, eventType, payload: payloadJson, processed: false },
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
