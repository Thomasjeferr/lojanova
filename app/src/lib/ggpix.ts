type PixChargeResponse = {
  chargeId: string;
  txid: string;
  brCode: string;
  qrCodeImage: string;
};

export async function createGgPixCharge({
  amountCents,
  payerName,
  apiKey,
  externalId,
}: {
  amountCents: number;
  payerName: string;
  apiKey: string;
  externalId: string;
}): Promise<PixChargeResponse> {
  const response = await fetch("https://ggpixapi.com/api/v1/pix-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      amountCents,
      description: `Compra de plano digital - ${payerName}`,
      externalId,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao gerar cobrança Pix na GGPIXAPI");
  }

  const data = (await response.json()) as Record<string, unknown>;
  const chargeId =
    (data.chargeId as string) ||
    (data.id as string) ||
    (data.transactionId as string) ||
    externalId;
  const txid = (data.txid as string) || (data.transactionId as string) || externalId;
  const brCode = (data.copyPaste as string) || (data.brCode as string) || "";
  const qrCodeImage =
    (data.qrCodeImage as string) ||
    (data.qrCode as string) ||
    "";

  if (!brCode || !qrCodeImage) {
    throw new Error("Resposta da GGPIXAPI inválida para geração de cobrança.");
  }

  return {
    chargeId,
    txid,
    brCode,
    qrCodeImage,
  };
}
