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

  const transactionId = String(
    payload.transactionId ??
      nestedData?.transactionId ??
      payload.id ??
      nestedData?.id ??
      "",
  ).trim();
  const externalId = String(payload.externalId ?? nestedData?.externalId ?? "").trim();
  const txidPix = String(payload.txid ?? nestedData?.txid ?? "").trim();

  const eventId = String(
    payload.eventId ?? transactionId ?? txidPix ?? externalId ?? payload.id ?? "",
  ).trim();

  const eventType = String(payload.type ?? payload.event ?? nestedData?.type ?? "unknown");
  const status = String(payload.status ?? nestedData?.status ?? nestedPix?.status ?? "").toUpperCase();
  /** GGPIXAPI usa COMPLETE no webhook oficial; não confundir com COMPLETED. */
  const paid =
    status === "PAID" ||
    status === "COMPLETED" ||
    status === "COMPLETE" ||
    status === "APPROVED" ||
    status === "CONFIRMED" ||
    eventType.toUpperCase().includes("PAID") ||
    eventType.toUpperCase().includes("CONFIRM") ||
    eventType.toUpperCase().includes("COMPLETE");

  if (!eventId) {
    return badRequest("Payload de webhook inválido: falta identificador do evento");
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

  const or: Prisma.OrderWhereInput[] = [];
  const refs = new Set<string>();
  for (const v of [transactionId, txidPix, externalId]) {
    if (v) refs.add(v);
  }
  for (const ref of refs) {
    or.push({ wooviTxid: ref }, { wooviChargeId: ref });
  }
  if (externalId) {
    or.push({ id: externalId });
  }

  if (or.length === 0) {
    return badRequest("Payload de webhook sem transactionId, txid ou externalId");
  }

  const order = await prisma.order.findFirst({ where: { OR: or } });
  if (!order) {
    return badRequest("Pedido não encontrado para esta transação (txid/charge/externalId)");
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
