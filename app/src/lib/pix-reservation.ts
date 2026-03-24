import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Tempo que o código fica reservado após gerar o Pix (30 minutos). */
export const PIX_RESERVATION_MS = 30 * 60 * 1000;

export function nextReservationDeadline(from: Date = new Date()): Date {
  return new Date(from.getTime() + PIX_RESERVATION_MS);
}

type Tx = Prisma.TransactionClient;

/**
 * Libera reservas de Pix expiradas (código volta a `available`, some da “reserva” do pedido).
 * Deve rodar no início de fluxos que contam estoque ou entregam pedidos.
 */
export async function releaseExpiredPixReservationsTx(tx: Tx): Promise<void> {
  await tx.activationCode.updateMany({
    where: {
      status: "reserved",
      reservedUntil: { lt: new Date() },
    },
    data: {
      status: "available",
      orderId: null,
      reservedUntil: null,
    },
  });
}

export async function releaseExpiredPixReservations(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await releaseExpiredPixReservationsTx(tx);
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
