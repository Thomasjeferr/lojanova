import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { runLowStockAlertJob } from "@/lib/low-stock-cron";

/**
 * Executa o mesmo job do cron (sem CRON_SECRET), só para admin diagnosticar envio.
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return forbidden();
  }

  try {
    const result = await runLowStockAlertJob();
    if (result.sent) {
      console.info("[low-stock-alert] admin run ok", { planCount: result.planCount });
    } else {
      console.warn("[low-stock-alert] admin run skipped", {
        skippedReason: result.skippedReason,
      });
    }
    const hints: Record<string, string> = {
      disabled: "Ative o alerta e salve nas configurações.",
      no_resend: "Defina RESEND_API_KEY no ambiente (Vercel).",
      no_recipient: "Preencha e-mail do destinatário ou ADMIN_EMAIL.",
      no_low_plans: "Nenhum plano ativo com estoque ≤ ao limite.",
      send_failed:
        "Resend rejeitou o envio — confira RESEND_FROM (domínio verificado) e logs do servidor.",
      no_settings_row: "AppSettings em falta na base.",
    };
    return ok({
      ...result,
      hint:
        !result.sent && result.skippedReason
          ? hints[result.skippedReason] ?? `Motivo: ${result.skippedReason}`
          : undefined,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return badRequest('Tabela inexistente. Rode "npx prisma db push" na pasta app.');
    }
    throw e;
  }
}
