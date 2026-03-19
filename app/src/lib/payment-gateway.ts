import { createWooviPixCharge } from "@/lib/woovi";
import { createGgPixCharge } from "@/lib/ggpix";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";

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
}: {
  amountCents: number;
  payerName: string;
  externalId: string;
}): Promise<PixChargeResponse> {
  const settings = await getPaymentGatewaySettings();

  if (settings.paymentProvider === "ggpix") {
    const apiKey = settings.ggpixApiKey || process.env.GGPIX_API_KEY || "";
    if (!apiKey.trim()) {
      throw new Error("GGPIXAPI não configurada. Informe a API Key no admin.");
    }
    return createGgPixCharge({
      amountCents,
      payerName,
      apiKey,
      externalId,
    });
  }

  return createWooviPixCharge({
    amountCents,
    payerName,
  });
}
