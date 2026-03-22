import { NextResponse } from "next/server";
import { getPaymentGatewaySettings } from "@/lib/woovi-settings";

/**
 * Dicas de checkout sem expor segredos — hoje só se o Pix exige CPF (GGPIXAPI).
 */
export async function GET() {
  try {
    const s = await getPaymentGatewaySettings();
    return NextResponse.json({
      requiresPayerCpf: s.paymentProvider === "ggpix",
    });
  } catch {
    return NextResponse.json({ requiresPayerCpf: true });
  }
}
