import { runLowStockAlertJob } from "@/lib/low-stock-cron";
import { ok, unauthorized } from "@/lib/http";

/** Vercel Cron envia GET com Authorization: Bearer CRON_SECRET (configure no painel). */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET não configurado no ambiente." },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return unauthorized("Token de cron inválido.");
  }

  const result = await runLowStockAlertJob();
  if (result.sent) {
    console.info("[low-stock-alert] cron ok", { planCount: result.planCount });
  } else {
    console.warn("[low-stock-alert] cron skipped", {
      skippedReason: result.skippedReason ?? "unknown",
    });
  }
  return ok(result);
}
