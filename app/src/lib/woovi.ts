import { getWooviSettings } from "@/lib/woovi-settings";

type PixChargeResponse = {
  chargeId: string;
  txid: string;
  brCode: string;
  qrCodeImage: string;
};

function asChargeRecord(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

function strVal(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function pickFirstString(obj: Record<string, unknown> | undefined, keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    const s = strVal(v);
    if (s) return s;
  }
  return "";
}

export async function createWooviPixCharge({
  amountCents,
  payerName,
  correlationID,
  payerDocument,
  payerEmail,
  payerPhone,
}: {
  amountCents: number;
  payerName: string;
  correlationID: string;
  payerDocument?: string;
  payerEmail?: string | null;
  payerPhone?: string | null;
}): Promise<PixChargeResponse> {
  const settings = await getWooviSettings();
  const apiKey = settings.wooviApiKey || process.env.WOOVI_API_KEY || "";

  if (!apiKey) {
    const fake = `MOCKPIX${Date.now()}`;
    return {
      chargeId: `mock_charge_${Date.now()}`,
      txid: fake,
      brCode: `${fake}000201`,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${fake}`,
    };
  }

  const email = (payerEmail ?? "").trim().toLowerCase();
  const phone = (payerPhone ?? "").replace(/\D/g, "");
  const taxID = (payerDocument ?? "").replace(/\D/g, "");
  if (!taxID && !email && !phone) {
    throw new Error(
      "Woovi: informe CPF/CNPJ, e-mail ou telefone do cliente para gerar a cobrança Pix.",
    );
  }

  const response = await fetch("https://api.woovi.com/api/v1/charge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      correlationID,
      value: amountCents,
      comment: "Compra de plano digital",
      customer: {
        name: payerName,
        ...(taxID ? { taxID } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      },
    }),
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = raw.slice(0, 280);
    try {
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const parts = [
        parsed.error,
        parsed.message,
        parsed.msg,
        parsed.detail,
      ].filter((v) => typeof v === "string" && v.trim()) as string[];
      if (parts.length > 0) detail = parts.join(" — ");
    } catch {
      /* mantém detail textual */
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Woovi (${response.status}): chave inválida/sem permissão. Verifique AppID e escopos CHARGE_POST + CHARGE_GET.`,
      );
    }
    throw new Error(`Woovi (${response.status}): ${detail || "falha ao gerar cobrança Pix"}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const charge = asChargeRecord(data.charge) ?? asChargeRecord(data);
  const pm = charge ? asChargeRecord(charge.paymentMethods) : undefined;
  const pmPix = pm ? asChargeRecord(pm.pix) : undefined;

  const chargeId =
    pickFirstString(charge, ["_id", "id"]) || pickFirstString(data, ["id", "_id"]);
  const txid =
    pickFirstString(charge, ["txid", "txId", "transactionID", "transactionId"]) ||
    pickFirstString(pmPix, ["txId", "txid", "transactionID", "transactionId"]) ||
    pickFirstString(data, ["txid", "txId"]);

  const brCode =
    pickFirstString(charge, ["brCode", "brcode"]) ||
    pickFirstString(pmPix, ["brCode", "brcode"]) ||
    pickFirstString(data, ["brCode", "brcode"]);

  const qrCodeImage =
    pickFirstString(charge, ["pixQrCodeImage", "qrCodeImage"]) ||
    pickFirstString(pmPix, ["qrCodeImage", "pixQrCodeImage"]) ||
    pickFirstString(data, ["pixQrCodeImage", "qrCodeImage"]);

  return {
    chargeId,
    txid: txid || chargeId,
    brCode,
    qrCodeImage,
  };
}

/**
 * Consulta cobrança na Woovi (fallback quando o webhook atrasa ou falha na validação).
 * Docs: GET /api/v1/charge/{id} — id pode ser _id da cobrança ou identificador Pix.
 */
export async function fetchWooviChargeStatus(
  chargeIdOrTxid: string,
  apiKey: string,
): Promise<string | null> {
  const key = apiKey.trim();
  const raw = chargeIdOrTxid.trim();
  if (!key || !raw) return null;

  const id = encodeURIComponent(raw);
  const res = await fetch(`https://api.woovi.com/api/v1/charge/${id}`, {
    method: "GET",
    headers: {
      Authorization: key,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  try {
    const data = (await res.json()) as Record<string, unknown>;
    const charge = asChargeRecord(data.charge) ?? data;
    const pm = asChargeRecord(charge.paymentMethods);
    const pmPix = pm ? asChargeRecord(pm.pix) : undefined;
    const pixCharge = pmPix ? asChargeRecord(pmPix.charge) : undefined;

    const status =
      pickFirstString(charge, ["status"]) ||
      pickFirstString(asChargeRecord(charge.pix), ["status"]) ||
      pickFirstString(pmPix, ["status"]) ||
      pickFirstString(pixCharge, ["status"]);
    return status || null;
  } catch {
    return null;
  }
}

/** Status retornado pela API / webhook Woovi quando o Pix foi pago. */
export function isWooviChargePaidStatus(status: string): boolean {
  const s = status.toUpperCase();
  return s === "COMPLETED" || s === "PAID" || s === "CONFIRMED";
}
