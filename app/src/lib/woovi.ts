import { getWooviSettings } from "@/lib/woovi-settings";

type PixChargeResponse = {
  chargeId: string;
  txid: string;
  brCode: string;
  qrCodeImage: string;
};

export async function createWooviPixCharge({
  amountCents,
  payerName,
}: {
  amountCents: number;
  payerName: string;
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

  const response = await fetch("https://api.woovi.com/api/v1/charge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      value: amountCents,
      comment: "Compra de plano digital",
      customer: {
        name: payerName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao gerar cobrança Pix");
  }

  const data = await response.json();
  return {
    chargeId: data.charge?._id || data.id,
    txid: data.charge?.txid || data.txid,
    brCode: data.charge?.brCode || data.brCode,
    qrCodeImage: data.charge?.pixQrCodeImage || data.pixQrCodeImage,
  };
}

function asChargeRecord(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

function strVal(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
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
    const status = strVal(charge.status);
    return status || null;
  } catch {
    return null;
  }
}

/** Status retornado pela API / webhook Woovi quando o Pix foi pago. */
export function isWooviChargePaidStatus(status: string): boolean {
  const s = status.toUpperCase();
  return s === "COMPLETED" || s === "PAID";
}
