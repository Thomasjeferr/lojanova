"use client";

import { currencyBRL } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { X } from "lucide-react";

type OrderRow = {
  id: string;
  userEmail: string;
  userName: string;
  planTitle: string;
  amountCents: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  code?: string;
};

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: OrderRow | null;
  onClose: () => void;
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
              ID
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-700">{order.id}</p>
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
              {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
          {order.paidAt && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pago em
              </p>
              <p className="mt-1 text-zinc-700">
                {new Date(order.paidAt).toLocaleString("pt-BR")}
              </p>
            </div>
          )}
          {order.code && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Código entregue
              </p>
              <p className="mt-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900">
                {order.code}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
