"use client";

import { useState } from "react";
import Link from "next/link";
import { currencyBRL } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";
import {
  AdminTable,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
} from "./admin-table";
import { ShoppingCart } from "lucide-react";
import { OrderDetailModal } from "./order-detail-modal";

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

export function AdminOrdersTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders] = useState<OrderRow[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const filtered = orders.filter(
    (o) => !filterStatus || o.status === filterStatus,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="filter-order-status">
          Filtrar por status
        </label>
        <select
          id="filter-order-status"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="failed">Falhou</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhum pedido"
          description="Os pedidos aparecerão aqui quando os clientes comprarem."
          action={
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Ver site
            </Link>
          }
        />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Plano</AdminTableHeaderCell>
              <AdminTableHeaderCell>Valor</AdminTableHeaderCell>
              <AdminTableHeaderCell>Status</AdminTableHeaderCell>
              <AdminTableHeaderCell>Data</AdminTableHeaderCell>
              <AdminTableHeaderCell>Código</AdminTableHeaderCell>
              <AdminTableHeaderCell className="w-20">Ações</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {filtered.map((row) => (
                <AdminTableRow
                  key={row.id}
                  onClick={() => setSelectedOrder(row)}
                >
                  <AdminTableCell>
                    <p className="font-medium text-zinc-900">{row.userEmail}</p>
                    {row.userName && (
                      <p className="text-xs text-zinc-500">{row.userName}</p>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="text-zinc-600">
                    {row.planTitle}
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-zinc-900 tabular-nums">
                    {currencyBRL(row.amountCents)}
                  </AdminTableCell>
                  <AdminTableCell>
                    <StatusBadge
                      status={
                        row.status as
                          | "pending"
                          | "paid"
                          | "failed"
                          | "cancelled"
                      }
                    />
                  </AdminTableCell>
                  <AdminTableCell className="text-zinc-500">
                    {new Date(row.createdAt).toLocaleString("pt-BR")}
                  </AdminTableCell>
                  <AdminTableCell className="font-mono text-xs text-zinc-600">
                    {row.code ? row.code.replace(/\n/g, " / ").slice(0, 28) + "…" : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(row);
                      }}
                    >
                      Ver
                    </button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        </>
      )}
    </div>
  );
}
