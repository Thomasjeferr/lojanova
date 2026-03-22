import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { deliverActivationCode } from "@/lib/delivery";
import { ok, badRequest } from "@/lib/http";
import { isValidWooviWebhookRequestWithSecret } from "@/lib/webhook-signature";
import { getWooviSettings } from "@/lib/woovi-settings";

function asObj(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Coleta identificadores Pix/cobrança no formato real da Woovi (OPENPIX:CHARGE_COMPLETED etc.).
 * O txid raramente vem em `payload.txid`; costuma estar em charge.transactionID, paymentMethods.pix.txId, etc.
 */
function collectWooviTransactionRefs(payload: Record<string, unknown>): string[] {
  const charge = asObj(payload.charge);
  const pix = asObj(payload.pix);
  const pixCharge = pix ? asObj(pix.charge) : undefined;
  const pm = charge ? asObj(charge.paymentMethods) : undefined;
  const pmPix = pm ? asObj(pm.pix) : undefined;

  const candidates: unknown[] = [
    payload.txid,
    charge?.txid,
    charge?.transactionID,
    charge?.identifier,
    pmPix?.txId,
    pmPix?.transactionID,
    pmPix?.identifier,
    pix?.transactionID,
    pixCharge?.transactionID,
    pixCharge?.identifier,
    charge?.correlationID,
    charge?.paymentLinkID,
    typeof charge?._id === "string" ? charge._id : undefined,
  ];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    const s = str(c);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function isWooviWebhookPaid(
  payload: Record<string, unknown>,
  eventName: string,
  charge: Record<string, unknown> | undefined,
  pix: Record<string, unknown> | undefined,
): boolean {
  const ev = eventName.toUpperCase();
  if (ev.includes("CHARGE_COMPLETED")) return true;
  if (ev.includes("MOVEMENT_CONFIRMED")) return true;

  const chargeSt = str(charge?.status).toUpperCase();
  const pixSt = str(pix?.status).toUpperCase();
  const pixCharge = pix ? asObj(pix.charge) : undefined;
  const pixChargeSt = str(pixCharge?.status).toUpperCase();

  if (str(payload.status).toUpperCase() === "PAID") return true;
  if (chargeSt === "COMPLETED" || chargeSt === "PAID") return true;
  if (pixChargeSt === "COMPLETED" || pixChargeSt === "PAID") return true;
  if (pixSt === "CONFIRMED" || pixSt === "COMPLETED") return true;

  return false;
}

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
  const charge = asObj(payload.charge);
  const pix = asObj(payload.pix);

  const eventName = str(payload.event) || str(payload.type) || "unknown";
  const eventType = eventName;

  const refs = collectWooviTransactionRefs(payload);
  const primaryRef = refs[0];

  const eventId =
    str(payload.eventId) ||
    str(payload.eventID) ||
    str(payload._id) ||
    (primaryRef ? `${eventName}:${primaryRef}` : "");

  if (!eventId) {
    return badRequest("Payload de webhook inválido: falta identificador do evento");
  }

  const paid = isWooviWebhookPaid(payload, eventName, charge, pix);

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

  if (refs.length === 0) {
    return badRequest("Webhook pago sem transactionID/txid identificável");
  }

  const orConditions: Prisma.OrderWhereInput[] = [];
  for (const r of refs) {
    orConditions.push({ wooviTxid: r }, { wooviChargeId: r });
  }

  const order = await prisma.order.findFirst({
    where: { OR: orConditions },
  });

  if (!order) {
    return badRequest("Pedido não encontrado para esta transação (txid/charge)");
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
