import { ok, unauthorized } from "@/lib/http";
import { releaseExpiredPixReservations } from "@/lib/pix-reservation";

/** Cron protegido por CRON_SECRET: libera reservas Pix expiradas e devolve códigos ao estoque. */
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

  const result = await releaseExpiredPixReservations();
  return ok({
    released: result.codesReleased,
    ordersCancelled: result.ordersCancelled,
  });
}
