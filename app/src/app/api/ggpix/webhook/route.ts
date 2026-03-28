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

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

/**
 * GGPIXAPI pode variar o formato do JSON entre eventos (criação vs confirmação).
 * Reúne todos os identificadores possíveis para casar com Order.wooviTxid / wooviChargeId / id.
 */
function collectGgPixTransactionRefs(payload: Record<string, unknown>): {
  refs: string[];
  externalIds: string[];
} {
  const nestedData = asObject(payload.data);
  const nestedPix = nestedData ? asObject(nestedData.pix) : null;
  const rootPix = asObject(payload.pix);
  const rootTx = asObject(payload.transaction);
  const nestedTx = nestedData ? asObject(nestedData.transaction) : null;
  const nestedPay = nestedData ? asObject(nestedData.payment) : null;
  const meta = asObject(payload.metadata) ?? (nestedData ? asObject(nestedData.metadata) : null);

  const idCandidates: unknown[] = [
    payload.transactionId,
    payload.transaction_id,
    payload.chargeId,
    payload.charge_id,
    nestedData?.transactionId,
    nestedData?.transaction_id,
    nestedData?.id,
    nestedData?.chargeId,
    nestedTx?.id,
    nestedTx?.transactionId,
    rootTx?.id,
    rootTx?.transactionId,
    payload.id,
    nestedPix?.transactionId,
    nestedPix?.id,
    rootPix?.transactionId,
    rootPix?.id,
    nestedPay?.transactionId,
    nestedPay?.id,
  ];

  const txidCandidates: unknown[] = [
    payload.txid,
    nestedData?.txid,
    nestedPix?.txid,
    rootPix?.txid,
    nestedPay?.txid,
  ];

  const externalCandidates: unknown[] = [
    payload.externalId,
    payload.external_id,
    nestedData?.externalId,
    nestedData?.external_id,
    meta?.externalId,
    meta?.orderId,
    meta?.order_id,
    nestedPay?.externalId,
  ];

  const refs = new Set<string>();
  const externalIds = new Set<string>();

  for (const c of [...idCandidates, ...txidCandidates]) {
    const s = str(c);
    if (s) refs.add(s);
  }
  for (const c of externalCandidates) {
    const s = str(c);
    if (s) {
      externalIds.add(s);
      refs.add(s);
    }
  }

  return { refs: [...refs], externalIds: [...externalIds] };
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
  const nestedPay = nestedData ? asObject(nestedData.payment) : null;

  const { refs: refList, externalIds } = collectGgPixTransactionRefs(payload);
  const transactionId = str(
    payload.transactionId ?? nestedData?.transactionId ?? payload.id ?? nestedData?.id,
  );
  const externalId = externalIds[0] ?? "";
  const txidPix = str(payload.txid ?? nestedData?.txid ?? nestedPix?.txid);

  const eventId = String(
    payload.eventId ??
      transactionId ??
      txidPix ??
      externalId ??
      refList[0] ??
      payload.id ??
      "",
  ).trim();

  const eventType = String(payload.type ?? payload.event ?? nestedData?.type ?? "unknown");
  const status = String(
    payload.status ??
      nestedData?.status ??
      nestedPix?.status ??
      nestedPay?.status ??
      "",
  ).toUpperCase();
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
  const refs = new Set<string>(refList);
  for (const v of [transactionId, txidPix, externalId]) {
    if (v) refs.add(v);
  }
  for (const ref of refs) {
    or.push({ wooviTxid: ref }, { wooviChargeId: ref });
  }
  for (const ext of externalIds) {
    or.push({ id: ext });
  }

  if (or.length === 0) {
    return badRequest("Payload de webhook sem transactionId, txid ou externalId");
  }

  const order = await prisma.order.findFirst({
    where: { OR: or },
    orderBy: { createdAt: "desc" },
  });
  if (!order) {
    console.warn("[ggpix/webhook] pedido nao encontrado", {
      eventType,
      status,
      refs: [...refs].slice(0, 12),
    });
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
