import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { cn, currencyBRL } from "@/lib/utils";
import { displayOrderNumber } from "@/lib/order-ref";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";

export type DashboardOrderRow = {
  id: string;
  orderNumber: number;
  email: string;
  planTitle: string;
  amountCents: number;
  status: "pending" | "paid" | "failed" | "cancelled";
};

type DashboardOrdersCardProps = {
  orders: DashboardOrderRow[];
};

export function DashboardOrdersCard({ orders }: DashboardOrdersCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)]",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Últimos pedidos
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Os 10 pedidos mais recentes da loja
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Ver todos
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="p-4 sm:p-6 sm:pt-5">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Nenhum pedido ainda"
            description="Os pedidos aparecerão aqui quando os clientes começarem a comprar."
            action={
              <Link
                href="/"
                className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Ver site
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order.id}>
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border border-transparent bg-zinc-50/40 p-4 transition duration-200",
                    "hover:border-zinc-200/80 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-zinc-900/[0.06] px-2.5 py-0.5 text-xs font-bold tabular-nums text-zinc-700 ring-1 ring-zinc-900/[0.06]">
                        {displayOrderNumber(order.orderNumber)}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {order.email}
                    </p>
                    <p className="text-sm text-zinc-500">
                      <span className="font-medium text-zinc-700">
                        {order.planTitle}
                      </span>
                      <span className="mx-1.5 text-zinc-300">·</span>
                      <span className="font-semibold tabular-nums text-zinc-800">
                        {currencyBRL(order.amountCents)}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 sm:pl-2">
                    <StatusBadge status={order.status} size="md" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
