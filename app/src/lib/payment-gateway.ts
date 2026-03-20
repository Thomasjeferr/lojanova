import { createWooviPixCharge } from "@/lib/woovi";
import { createGgPixCharge } from "@/lib/ggpix";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";

type PixChargeResponse = {
  chargeId: string;
  txid: string;
  brCode: string;
  qrCodeImage: string;
};

export async function createPixChargeByActiveProvider({
  amountCents,
  payerName,
  externalId,
  payerDocument,
  payerEmail,
  payerPhone,
}: {
  amountCents: number;
  payerName: string;
  externalId: string;
  payerDocument?: string;
  payerEmail?: string | null;
  payerPhone?: string | null;
}): Promise<PixChargeResponse> {
  const settings = await getPaymentGatewaySettings();

  if (settings.paymentProvider === "ggpix") {
    const apiKey = settings.ggpixApiKey || process.env.GGPIX_API_KEY || "";
    if (!apiKey.trim()) {
      throw new Error("GGPIXAPI não configurada. Informe a API Key no admin.");
    }
    const doc = normalizePayerDocument(payerDocument ?? "");
    if (!isValidPayerDocument(doc)) {
      throw new Error("Informe um CPF válido do pagador para o Pix pela GGPIXAPI.");
    }
    return createGgPixCharge({
      amountCents,
      payerName,
      payerDocument: doc,
      apiKey,
      externalId,
      payerEmail,
      payerPhone,
    });
  }

  return createWooviPixCharge({
    amountCents,
    payerName,
  });
}
