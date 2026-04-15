"use client";

import { currencyBRL } from "@/lib/utils";
import { displayOrderNumber } from "@/lib/order-ref";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { StatusBadge } from "./status-badge";

export type CustomerOrderRow = {
  id: string;
  orderNumber: number;
  status: string;
  amountCents: number;
  createdAt: string;
  paidAt: string | null;
  planTitle: string;
};

type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  paidCount: number;
  totalPaidCents: number;
};

export function CustomerDetailModal({
  customer,
  orders,
  onClose,
}: {
  customer: CustomerSummary | null;
  orders: CustomerOrderRow[];
  onClose: () => void;
}) {
  if (!customer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-700/90 dark:bg-zinc-900 dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2
              id="customer-modal-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {customer.name}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{customer.email}</p>
            {customer.phone ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{customer.phone}</p>
            ) : null}
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              Cadastro:{" "}
              {formatDateTimePtBr(customer.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-px border-b border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/80">
          <div className="bg-white px-3 py-3 text-center dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Pedidos
            </p>
            <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {customer.orderCount}
            </p>
          </div>
          <div className="bg-white px-3 py-3 text-center dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Pagos
            </p>
            <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {customer.paidCount}
            </p>
          </div>
          <div className="bg-white px-3 py-3 text-center dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Total pago
            </p>
            <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {currencyBRL(customer.totalPaidCents)}
            </p>
          </div>
        </div>

        <div className="max-h-[min(50vh,420px)] overflow-y-auto px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Histórico de pedidos
          </h3>
          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum pedido ainda. O cliente ainda não finalizou uma compra.
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                      {displayOrderNumber(o.orderNumber)}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTimePtBr(o.createdAt)}
                    </span>
                    <StatusBadge
                      status={
                        o.status as
                          | "pending"
                          | "paid"
                          | "failed"
                          | "cancelled"
                      }
                    />
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {o.planTitle}
                  </p>
                  <p className="text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
                    {currencyBRL(o.amountCents)}
                  </p>
                  {o.paidAt ? (
                    <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                      Pago em{" "}
                      {formatDateTimePtBr(o.paidAt)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
