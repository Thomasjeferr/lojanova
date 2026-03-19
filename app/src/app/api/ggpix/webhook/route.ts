import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deliverActivationCode } from "@/lib/delivery";
import { badRequest, ok } from "@/lib/http";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";
import { isValidGgPixWebhookRequestWithSecret } from "@/lib/webhook-signature";

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const settings = await getPaymentGatewaySettings();
  const webhookSecret = settings.ggpixWebhookSecret || process.env.GGPIX_WEBHOOK_SECRET || "";

  if (!webhookSecret.trim()) {
    return badRequest(
      "Webhook desabilitado: configure o Webhook Secret da GGPIXAPI no admin ou no ambiente",
    );
  }

  if (!isValidGgPixWebhookRequestWithSecret(rawBody, request, webhookSecret)) {
    return badRequest("Assinatura de webhook inválida");
  }

  let payloadRaw: unknown;
  try {
    payloadRaw = JSON.parse(rawBody);
  } catch {
    return badRequest("Payload JSON inválido");
  }

  const payload = asObject(payloadRaw);
  if (!payload) {
    return badRequest("Payload JSON inválido");
  }
  const payloadJson = payloadRaw as Prisma.InputJsonValue;

  const nestedData = asObject(payload.data);
  const nestedPix = nestedData ? asObject(nestedData.pix) : null;

  const eventId = String(
    payload.eventId ??
      payload.id ??
      nestedData?.id ??
      payload.externalId ??
      nestedData?.externalId ??
      payload.txid ??
      nestedData?.txid ??
      "",
  );
  const eventType = String(payload.type ?? payload.event ?? nestedData?.type ?? "unknown");
  const status = String(payload.status ?? nestedData?.status ?? nestedPix?.status ?? "").toUpperCase();
  const txid = String(
    payload.txid ??
      nestedData?.txid ??
      payload.transactionId ??
      nestedData?.transactionId ??
      payload.externalId ??
      nestedData?.externalId ??
      "",
  );
  const paid =
    status === "PAID" ||
    status === "COMPLETED" ||
    status === "APPROVED" ||
    status === "CONFIRMED" ||
    eventType.toUpperCase().includes("PAID") ||
    eventType.toUpperCase().includes("CONFIRMED");

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
