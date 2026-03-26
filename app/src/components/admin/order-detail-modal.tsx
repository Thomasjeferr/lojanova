"use client";

import { currencyBRL } from "@/lib/utils";
import { copyOrderNumber, displayOrderNumber } from "@/lib/order-ref";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { CopyButton } from "@/components/account/copy-button";
import { StatusBadge } from "./status-badge";
import { X } from "lucide-react";

export type OrderRow = {
  id: string;
  orderNumber: number;
  userEmail: string;
  userName: string;
  planTitle: string;
  amountCents: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  code?: string;
  /** Já existe registro de entrega (permite reenviar e-mail/SMS) */
  hasDelivery?: boolean;
};

export function OrderDetailModal({
  order,
  onClose,
  approvingId,
  onApprove,
  cancellingId,
  onCancel,
}: {
  order: OrderRow | null;
  onClose: () => void;
  approvingId: string | null;
  onApprove: (row: OrderRow) => void | Promise<void>;
  cancellingId: string | null;
  onCancel: (row: OrderRow) => void | Promise<void>;
}) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            Detalhes do pedido
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Nº do pedido (cliente)
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
              {displayOrderNumber(order.orderNumber)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CopyButton
                value={copyOrderNumber(order.orderNumber)}
                label="Copiar nº curto"
                variant="outline"
                className="text-xs"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              É o número que o cliente vê em &quot;Meus pedidos&quot; e no checkout.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              ID técnico
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-zinc-500">
              {order.id}
            </p>
            <div className="mt-1.5">
              <CopyButton
                value={order.id}
                label="Copiar ID"
                variant="outline"
                className="text-xs"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cliente
            </p>
            <p className="mt-1 font-medium text-zinc-900">{order.userEmail}</p>
            {order.userName && (
              <p className="text-sm text-zinc-600">{order.userName}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Plano
            </p>
            <p className="mt-1 text-zinc-900">{order.planTitle}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Valor
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900">
              {currencyBRL(order.amountCents)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Status
            </p>
            <div className="mt-1.5">
              <StatusBadge
                status={
                  order.status as
                    | "pending"
                    | "paid"
                    | "failed"
                    | "cancelled"
                }
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Data do pedido
            </p>
            <p className="mt-1 text-zinc-700">
              {formatDateTimePtBr(order.createdAt)}
            </p>
          </div>
          {order.paidAt && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pago em
              </p>
              <p className="mt-1 text-zinc-700">
                {formatDateTimePtBr(order.paidAt)}
              </p>
            </div>
          )}
          {order.code && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Código entregue
              </p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900">
                {order.code}
              </p>
            </div>
          )}
        </div>
        {order.status !== "cancelled" ? (
          <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-6 py-4">
            <button
              type="button"
              disabled={approvingId === order.id}
              onClick={() => void onApprove(order)}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {approvingId === order.id
                ? "Processando…"
                : order.hasDelivery
                  ? "Reenviar e-mail / SMS"
                  : "Aprovar e entregar"}
            </button>
            <p className="w-full text-xs text-zinc-500">
              {order.hasDelivery
                ? "Reenvia as mesmas credenciais já vinculadas ao pedido."
                : "Confirme o pagamento fora do sistema: vincula um código disponível, marca como pago e dispara e-mail e SMS."}
            </p>
            {order.status !== "paid" ? (
              <>
                <button
                  type="button"
                  disabled={cancellingId === order.id}
                  onClick={() => void onCancel(order)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {cancellingId === order.id ? "Cancelando…" : "Cancelar pedido"}
                </button>
                <p className="w-full text-xs text-zinc-500">
                  Cancela o pedido e, se houver código reservado, ele volta para o estoque.
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
