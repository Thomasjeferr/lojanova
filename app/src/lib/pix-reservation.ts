import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Tempo que o código fica reservado após gerar o Pix (30 minutos). */
export const PIX_RESERVATION_MS = 30 * 60 * 1000;

export function nextReservationDeadline(from: Date = new Date()): Date {
  return new Date(from.getTime() + PIX_RESERVATION_MS);
}

type Tx = Prisma.TransactionClient;

export type ReleaseExpiredPixReservationsResult = {
  codesReleased: number;
  ordersCancelled: number;
  /** Pedidos pendentes órfãos (sem reserva ativa / sem Pix) cancelados no mesmo ciclo. */
  stalePendingCancelled: number;
};

function orderHasPixRefs(o: {
  wooviChargeId: string | null;
  wooviTxid: string | null;
  pixCorrelationId: string | null;
}): boolean {
  return Boolean(
    o.wooviChargeId?.trim() || o.wooviTxid?.trim() || o.pixCorrelationId?.trim(),
  );
}

/**
 * Libera reservas de Pix expiradas (código volta a `available`) e cancela pedidos `pending`
 * ligados a essas reservas. Pagamento confirmado depois disso ainda pode ser processado pelo
 * webhook (`deliverActivationCode` associa outro código disponível).
 *
 * Em seguida cancela pedidos `pending` fora da janela: sem cobrança Pix persistida há mais de
 * {@link PIX_RESERVATION_MS}, ou com Pix mas sem reserva ativa há mais de {@link PIX_RESERVATION_MS}
 * desde a última atualização relevante do pedido.
 */
export async function releaseExpiredPixReservationsTx(
  tx: Tx,
): Promise<ReleaseExpiredPixReservationsResult> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - PIX_RESERVATION_MS);

  const expired = await tx.activationCode.findMany({
    where: {
      status: "reserved",
      reservedUntil: { lt: now },
    },
    select: { orderId: true },
  });

  const orderIds = [
    ...new Set(expired.map((c) => c.orderId).filter((id): id is string => id != null)),
  ];

  const codes = await tx.activationCode.updateMany({
    where: {
      status: "reserved",
      reservedUntil: { lt: now },
    },
    data: {
      status: "available",
      orderId: null,
      reservedUntil: null,
    },
  });

  let ordersCancelled = 0;
  if (orderIds.length > 0) {
    const o = await tx.order.updateMany({
      where: {
        id: { in: orderIds },
        status: "pending",
      },
      data: { status: "cancelled" },
    });
    ordersCancelled = o.count;
  }

  const staleCandidates = await tx.order.findMany({
    where: {
      status: "pending",
      OR: [{ createdAt: { lt: cutoff } }, { updatedAt: { lt: cutoff } }],
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      wooviChargeId: true,
      wooviTxid: true,
      pixCorrelationId: true,
      activationCode: { select: { status: true, reservedUntil: true } },
    },
    take: 500,
    orderBy: { createdAt: "asc" },
  });

  const idsToCancel = new Set<string>();
  for (const o of staleCandidates) {
    const ac = o.activationCode;
    const activeReservation =
      ac?.status === "reserved" &&
      ac.reservedUntil != null &&
      ac.reservedUntil.getTime() > now.getTime();
    if (activeReservation) continue;

    const hasPix = orderHasPixRefs(o);
    if (!hasPix) {
      if (o.createdAt.getTime() < cutoff.getTime()) {
        idsToCancel.add(o.id);
      }
      continue;
    }

    const refTime = o.updatedAt > o.createdAt ? o.updatedAt : o.createdAt;
    if (refTime.getTime() + PIX_RESERVATION_MS < now.getTime()) {
      idsToCancel.add(o.id);
    }
  }

  let stalePendingCancelled = 0;
  if (idsToCancel.size > 0) {
    const u = await tx.order.updateMany({
      where: { id: { in: [...idsToCancel] }, status: "pending" },
      data: { status: "cancelled" },
    });
    stalePendingCancelled = u.count;
  }

  return {
    codesReleased: codes.count,
    ordersCancelled,
    stalePendingCancelled,
  };
}

export async function releaseExpiredPixReservations(): Promise<ReleaseExpiredPixReservationsResult> {
  return prisma.$transaction(async (tx) => {
    return releaseExpiredPixReservationsTx(tx);
  });
}

/**
 * Se a geração do Pix falhar após reservar, devolve o código ao estoque imediatamente.
 */
export async function releasePixReservationForOrder(orderId: string): Promise<void> {
  await prisma.activationCode.updateMany({
    where: { orderId, status: "reserved" },
    data: {
      status: "available",
      orderId: null,
      reservedUntil: null,
    },
  });
}

/**
 * Garante que o pedido pendente tem um código reservado para o plano (ou renova o prazo).
 * Lança Error com mensagem amigável se não houver estoque livre.
 */
export async function ensurePixReservationForOrder(
  tx: Tx,
  order: { id: string; planId: string },
): Promise<void> {
  await releaseExpiredPixReservationsTx(tx);

  const fresh = await tx.order.findUnique({
    where: { id: order.id },
    include: { activationCode: true },
  });
  if (!fresh) {
    throw new Error("Pedido não encontrado");
  }
  if (fresh.status !== "pending") {
    throw new Error("Este pedido não está pendente para geração de Pix.");
  }

  const now = new Date();
  const ac = fresh.activationCode;

  if (ac?.status === "reserved" && ac.reservedUntil && ac.reservedUntil > now) {
    await tx.activationCode.update({
      where: { id: ac.id },
      data: { reservedUntil: nextReservationDeadline(now) },
    });
    return;
  }

  const rows = await tx.$queryRaw<
    Array<{
      id: string;
    }>
  >`
    SELECT id
    FROM "ActivationCode"
    WHERE "planId" = ${order.planId}
      AND status = 'available'
    ORDER BY "createdAt" ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  `;

  const picked = rows[0];
  if (!picked) {
    throw new Error("Sem códigos disponíveis para este plano no momento. Tente outro plano ou mais tarde.");
  }

  await tx.activationCode.update({
    where: { id: picked.id },
    data: {
      status: "reserved",
      orderId: fresh.id,
      reservedUntil: nextReservationDeadline(now),
    },
  });
}
