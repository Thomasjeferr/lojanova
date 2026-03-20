import { isValidPayerDocument } from "@/lib/payer-document";

type PixChargeResponse = {
  chargeId: string;
  txid: string;
  brCode: string;
  qrCodeImage: string;
};

/** Documentação: POST /api/v1/pix/in com X-API-Key e payerDocument obrigatório. */
const GGPIX_PIX_IN_URL = "https://ggpixapi.com/api/v1/pix/in";
const GGPIX_API_BASE = "https://ggpixapi.com/api/v1";

/** Polling oficial quando o webhook atrasa ou falha na validação. */
export async function fetchGgPixTransactionById(
  transactionId: string,
  apiKey: string,
): Promise<{ status: string } | null> {
  const key = apiKey.trim().replace(/^Bearer\s+/i, "");
  const id = encodeURIComponent(transactionId.trim());
  if (!id) return null;

  const res = await fetch(`${GGPIX_API_BASE}/transactions/${id}`, {
    method: "GET",
    headers: {
      "X-API-Key": key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  try {
    const data = (await res.json()) as Record<string, unknown>;
    return { status: String(data.status ?? "") };
  } catch {
    return null;
  }
}

export async function createGgPixCharge({
  amountCents,
  payerName,
  payerDocument,
  apiKey,
  externalId,
  payerEmail,
  payerPhone,
}: {
  amountCents: number;
  payerName: string;
  payerDocument: string;
  apiKey: string;
  externalId: string;
  payerEmail?: string | null;
  payerPhone?: string | null;
}): Promise<PixChargeResponse> {
  const key = apiKey.trim().replace(/^Bearer\s+/i, "");
  const doc = payerDocument.replace(/\D/g, "");
  if (!isValidPayerDocument(doc)) {
    throw new Error("CPF do pagador inválido para a GGPIXAPI.");
  }

  const body: Record<string, unknown> = {
    amountCents,
    description: `Compra de plano digital - ${payerName.trim()}`,
    payerName: payerName.trim(),
    payerDocument: doc,
    externalId,
  };
  if (payerEmail?.trim()) body.payerEmail = payerEmail.trim().toLowerCase();
  const phoneDigits = (payerPhone ?? "").replace(/\D/g, "");
  if (phoneDigits.length >= 10) body.payerPhone = phoneDigits;

  const response = await fetch(GGPIX_PIX_IN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data: Record<string, unknown>;
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    throw new Error(
      `GGPIXAPI respondeu com corpo inválido (${response.status}). Verifique a URL e a chave.`,
    );
  }

  if (!response.ok) {
    const parts = [data.error, data.message].filter((v) => typeof v === "string" && v.trim());
    const detail = parts.length > 0 ? parts.join(" — ") : raw.slice(0, 280);
    throw new Error(
      `GGPIXAPI (${response.status}): ${detail || "falha ao criar cobrança"}`,
    );
  }

  const brCode = String(
    data.pixCopyPaste ?? data.pixCode ?? data.copyPaste ?? data.brCode ?? "",
  ).trim();
  const chargeId = String(data.id ?? data.chargeId ?? data.transactionId ?? externalId);
  const txid = String(data.txid ?? data.transactionId ?? chargeId);

  const directImg = String(data.qrCodeImage ?? "").trim();
  const qrCodeImage =
    directImg.startsWith("http")
      ? directImg
      : brCode
        ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(brCode)}`
        : "";

  if (!brCode || !qrCodeImage) {
    throw new Error(
      "Resposta da GGPIXAPI sem código Pix ou QR. Confira a versão da API no painel.",
    );
  }

  return {
    chargeId,
    txid,
    brCode,
    qrCodeImage,
  };
}
