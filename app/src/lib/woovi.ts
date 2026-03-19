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
