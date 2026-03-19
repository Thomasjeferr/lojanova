"use client";

import Link from "next/link";
import { CopyButton } from "./copy-button";
import { StatusBadge } from "./status-badge";
import { Card } from "@/components/ui/card";
import { currencyBRL } from "@/lib/utils";

type LastAccessItem = {
  id: string;
  planTitle: string;
  durationDays: number;
  code: string;
  deliveredAt: Date | string;
};

type LastOrderItem = {
  id: string;
  planTitle: string;
  amountCents: number;
  status: string;
  createdAt: Date | string;
};

type AccountDashboardClientProps = {
  lastAccess: LastAccessItem[];
  lastOrders: LastOrderItem[];
};

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function AccountDashboardClient({
  lastAccess,
  lastOrders,
}: AccountDashboardClientProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Últimos acessos</h2>
        {lastAccess.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Nenhum código ainda.{" "}
            <Link href="/#planos" className="theme-link font-medium hover:underline">
              Comprar plano
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lastAccess.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">{item.planTitle}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(item.deliveredAt)}
                  </p>
                </div>
                <CopyButton value={item.code} />
              </li>
            ))}
          </ul>
        )}
        {lastAccess.length > 0 && (
          <Link
            href="/account/access"
            className="theme-link mt-4 inline-block text-sm font-medium hover:underline"
          >
            Ver todos →
          </Link>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Últimos pedidos</h2>
        {lastOrders.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Nenhum pedido ainda.{" "}
            <Link href="/#planos" className="theme-link font-medium hover:underline">
              Comprar plano
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {lastOrders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">{o.planTitle}</p>
                  <p className="text-xs text-zinc-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <span className="font-medium text-zinc-900">
                    {currencyBRL(o.amountCents)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {lastOrders.length > 0 && (
          <Link
            href="/account/orders"
            className="theme-link mt-4 inline-block text-sm font-medium hover:underline"
          >
            Ver todos →
          </Link>
        )}
      </Card>
    </div>
  );
}
