"use client";

import { useState } from "react";
import Link from "next/link";
import { currencyBRL } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { CopyButton } from "./copy-button";
import { EmptyState } from "./empty-state";
import { ShoppingBag, Eye, CreditCard } from "lucide-react";
import { PayPendingOrderModal } from "@/components/account/pay-pending-order-modal";
import { Button } from "@/components/ui/button";

export type OrderRow = {
  id: string;
  planTitle: string;
  durationDays: number;
  amountCents: number;
  status: string;
  createdAt: string;
  code?: string | null;
  paidAt?: string | null;
};

type OrdersTableProps = {
  orders: OrderRow[];
};

function formatDate(s: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(s));
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [payOrder, setPayOrder] = useState<OrderRow | null>(null);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nenhum pedido ainda"
        description="Quando você comprar um plano, ele aparecerá aqui."
        actionLabel="Comprar plano"
        actionHref="/#planos"
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/80">
                <th className="px-4 py-3 font-semibold text-zinc-900">Pedido</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Plano</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Valor</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Status</th>
                <th className="px-4 py-3 font-semibold text-zinc-900">Data</th>
                <th className="px-4 py-3 font-semibold text-zinc-900 text-right">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-100 transition hover:bg-zinc-50/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {order.id.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900">
                      {order.planTitle}
                    </span>
                    <span className="ml-1 text-zinc-500">
                      ({order.durationDays} dias)
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {currencyBRL(order.amountCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setPayOrder(order)}
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pagar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--theme-primary)] hover:bg-[var(--theme-soft)]"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes do pedido"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">
              Detalhes do pedido
            </h3>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              {detailOrder.id}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500">Plano</dt>
                <dd className="font-medium text-zinc-900">
                  {detailOrder.planTitle} ({detailOrder.durationDays} dias)
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Valor</dt>
                <dd className="font-medium text-zinc-900">
                  {currencyBRL(detailOrder.amountCents)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Status</dt>
                <dd>
                  <StatusBadge status={detailOrder.status} />
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Data</dt>
                <dd className="font-medium text-zinc-900">
                  {formatDate(detailOrder.createdAt)}
                </dd>
              </div>
              {detailOrder.code && (
                <div>
                  <dt className="text-zinc-500">Credencial entregue</dt>
                  <dd className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="whitespace-pre-wrap rounded-lg border bg-zinc-50 px-3 py-2 font-mono text-sm">
                      {detailOrder.code}
                    </span>
                    <CopyButton value={detailOrder.code} />
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {detailOrder.status === "pending" && (
                <Button
                  type="button"
                  variant="theme"
                  className="rounded-xl"
                  onClick={() => {
                    setPayOrder(detailOrder);
                    setDetailOrder(null);
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar com Pix
                </Button>
              )}
              <Link
                href="/#planos"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Comprar novamente
              </Link>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {payOrder && (
        <PayPendingOrderModal
          open={Boolean(payOrder)}
          onClose={() => setPayOrder(null)}
          orderId={payOrder.id}
          planTitle={payOrder.planTitle}
          amountCents={payOrder.amountCents}
        />
      )}
    </>
  );
}
