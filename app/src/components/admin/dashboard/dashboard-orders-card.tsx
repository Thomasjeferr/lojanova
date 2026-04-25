import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { cn, currencyBRL } from "@/lib/utils";
import { displayOrderNumber } from "@/lib/order-ref";
import { EmptyState } from "@/components/admin/empty-state";
import { toAdminPath } from "@/lib/admin-path";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

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

function OrderStatusPill({ status }: { status: DashboardOrderRow["status"] }) {
  if (status === "paid") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-1 text-[var(--font-xs)] font-semibold",
          "border-[rgba(0,212,161,0.2)] bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]" aria-hidden />
        Pago
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-1 text-[var(--font-xs)] font-semibold",
          "border-[rgba(255,77,106,0.2)] bg-[var(--accent-red-dim)] text-[var(--accent-red)]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-red)]" aria-hidden />
        Cancelado
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-1 text-[var(--font-xs)] font-semibold",
          "border-[rgba(245,158,11,0.2)] bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-amber)]" aria-hidden />
        Pendente
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-2.5 py-1 text-[var(--font-xs)] font-semibold",
          "border-[rgba(59,130,246,0.22)] bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-blue)]" aria-hidden />
        Falhou
      </span>
    );
  }
  return null;
}

export function DashboardOrdersCard({ orders }: DashboardOrdersCardProps) {
  return (
    <section className={cn(adminPremiumCard, "flex flex-col")}>
      <div className={adminPremiumCardAccent} aria-hidden />
      <div
        className={cn(
          adminPremiumCardHeader,
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-7",
        )}
      >
        <div>
          <h2 className={cn(adminPremiumHeading, "text-[var(--font-lg)]")}>Últimos pedidos</h2>
          <p className={adminPremiumSub}>Os 10 pedidos mais recentes da loja</p>
        </div>
        <Link
          href={toAdminPath("orders")}
          className="group inline-flex items-center gap-1 text-[var(--font-sm)] font-semibold text-[var(--accent-purple)] transition hover:brightness-110"
        >
          Ver todos
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
      </div>

      <div className="relative z-[2] overflow-x-auto p-0 sm:px-2 sm:pb-4 sm:pt-2">
        {orders.length === 0 ? (
          <div className="p-6 sm:p-7">
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum pedido ainda"
              description="Os pedidos aparecerão aqui quando os clientes começarem a comprar."
              action={
                <Link
                  href="/"
                  className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--accent-purple)] px-4 py-2.5 text-[var(--font-sm)] font-semibold text-white shadow-[var(--shadow-glow-purple)] transition hover:brightness-110"
                >
                  Ver site
                </Link>
              }
            />
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Últimos pedidos da loja</caption>
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--font-xs)] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Pedido
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  E-mail
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Produto
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Valor
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-default border-b border-[var(--border-subtle)] transition-colors duration-150 ease-out hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <td className="px-5 py-3.5 align-middle">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface-3)] px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-[var(--text-secondary)]",
                      )}
                    >
                      {displayOrderNumber(order.orderNumber)}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-3.5 align-middle font-mono text-[var(--font-sm)] text-[var(--text-secondary)]">
                    {order.email}
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-3.5 align-middle text-[var(--font-sm)] text-[var(--text-secondary)]">
                    {order.planTitle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right align-middle text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                    {currencyBRL(order.amountCents)}
                  </td>
                  <td className="px-5 py-3.5 text-right align-middle">
                    <OrderStatusPill status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
