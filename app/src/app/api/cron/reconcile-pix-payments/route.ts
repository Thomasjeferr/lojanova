import { ok, unauthorized } from "@/lib/http";
import { reconcilePendingPixOrders } from "@/lib/reconcile-pending-pix";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Cron: reconcilia pedidos Pix pendentes com a API do gateway (GGPIXAPI / Woovi).
 * Complementa webhook + polling do checkout — reduz risco de cliente estornar no app do banco.
 */
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

  const result = await reconcilePendingPixOrders();
  return ok(result);
}
