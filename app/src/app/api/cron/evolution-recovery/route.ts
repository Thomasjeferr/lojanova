import { ok, unauthorized } from "@/lib/http";
import { runEvolutionRecoveryJob } from "@/lib/evolution-recovery-cron";

/** Lembrete WhatsApp (Evolution) para pedidos pendentes — protegido por CRON_SECRET. */
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

  const result = await runEvolutionRecoveryJob();
  return ok({
    checked: result.checked,
    sent: result.sent,
  });
}
