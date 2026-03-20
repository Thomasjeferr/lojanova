"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { currencyBRL } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import {
  AdminTable,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
} from "./admin-table";
import { Users } from "lucide-react";
import {
  CustomerDetailModal,
  type CustomerOrderRow,
} from "./customer-detail-modal";

export type AdminCustomerOrderRow = CustomerOrderRow;

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  paidCount: number;
  totalPaidCents: number;
  lastActivityAt: string | null;
  orders: AdminCustomerOrderRow[];
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

function matchesSearch(row: AdminCustomerRow, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  return (
    row.name.toLowerCase().includes(n) ||
    row.email.toLowerCase().includes(n) ||
    (row.phone?.toLowerCase().includes(n) ?? false)
  );
}

export function AdminCustomersTable({
  initialCustomers,
}: {
  initialCustomers: AdminCustomerRow[];
}) {
  const [customers] = useState<AdminCustomerRow[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "with_orders" | "paid">("all");
  const [sort, setSort] = useState<
    "signup_desc" | "orders_desc" | "revenue_desc" | "last_activity"
  >("signup_desc");
  const [selected, setSelected] = useState<AdminCustomerRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100);

  const filtered = useMemo(() => {
    let list = customers.filter((c) => matchesSearch(c, search));
    if (filter === "with_orders") {
      list = list.filter((c) => c.orderCount > 0);
    }
    if (filter === "paid") {
      list = list.filter((c) => c.paidCount > 0);
    }
    const next = [...list];
    next.sort((a, b) => {
      switch (sort) {
        case "orders_desc":
          return b.orderCount - a.orderCount;
        case "revenue_desc":
          return b.totalPaidCents - a.totalPaidCents;
        case "last_activity": {
          const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
          const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
          return tb - ta;
        }
        case "signup_desc":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return next;
  }, [customers, search, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, filter, sort, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const rangeLabel = useMemo(() => {
    if (filtered.length === 0) return { from: 0, to: 0 };
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, filtered.length);
    return { from, to };
  }, [filtered.length, page, pageSize]);

  const stats = useMemo(() => {
    const withOrder = customers.filter((c) => c.orderCount > 0).length;
    const paidEver = customers.filter((c) => c.paidCount > 0).length;
    const revenue = customers.reduce((s, c) => s + c.totalPaidCents, 0);
    return { withOrder, paidEver, revenue, total: customers.length };
  }, [customers]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm">
        <div>
          <span className="text-zinc-500">Clientes: </span>
          <span className="font-semibold tabular-nums text-zinc-900">
            {stats.total}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Com pedido: </span>
          <span className="font-semibold tabular-nums text-zinc-900">
            {stats.withOrder}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Já pagaram: </span>
          <span className="font-semibold tabular-nums text-zinc-900">
            {stats.paidEver}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Receita (pagos): </span>
          <span className="font-semibold tabular-nums text-zinc-900">
            {currencyBRL(stats.revenue)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor="customer-search">
          Buscar cliente
        </label>
        <input
          id="customer-search"
          type="search"
          placeholder="Buscar por nome, e-mail ou telefone…"
          className="min-w-[200px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          aria-label="Filtrar clientes"
        >
          <option value="all">Todos</option>
          <option value="with_orders">Com pelo menos 1 pedido</option>
          <option value="paid">Com pagamento confirmado</option>
        </select>
        <select
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Ordenar lista"
        >
          <option value="signup_desc">Cadastro (mais recente)</option>
          <option value="last_activity">Última atividade</option>
          <option value="orders_desc">Mais pedidos</option>
          <option value="revenue_desc">Maior total pago</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="whitespace-nowrap">Por página</span>
          <select
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Quantidade de clientes por página"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Ver pedidos
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={customers.length === 0 ? "Nenhum cliente" : "Nenhum resultado"}
          description={
            customers.length === 0
              ? "Os cadastros de clientes (exceto administradores) aparecerão aqui."
              : "Tente outro termo de busca ou altere os filtros."
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-zinc-600">
              Mostrando{" "}
              <span className="font-semibold tabular-nums text-zinc-900">
                {rangeLabel.from}–{rangeLabel.to}
              </span>{" "}
              de{" "}
              <span className="font-semibold tabular-nums text-zinc-900">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "cliente" : "clientes"}
              {filtered.length !== customers.length ? (
                <span className="text-zinc-400">
                  {" "}
                  (filtro sobre {customers.length} no total)
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums text-zinc-600">
                Página{" "}
                <span className="font-semibold text-zinc-900">{page}</span> de{" "}
                <span className="font-semibold text-zinc-900">{pageCount}</span>
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>

          <AdminTable>
            <AdminTableHead>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Telefone</AdminTableHeaderCell>
              <AdminTableHeaderCell>Cadastro</AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">
                Pedidos
              </AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">
                Pagos
              </AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">
                Total pago
              </AdminTableHeaderCell>
              <AdminTableHeaderCell>Última atividade</AdminTableHeaderCell>
              <AdminTableHeaderCell className="w-20">Ações</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {paginated.map((row) => (
                <AdminTableRow
                  key={row.id}
                  onClick={() => setSelected(row)}
                >
                  <AdminTableCell>
                    <p className="font-medium text-zinc-900">{row.name}</p>
                    <p className="text-xs text-zinc-500">{row.email}</p>
                  </AdminTableCell>
                  <AdminTableCell className="text-zinc-600">
                    {row.phone?.trim() || "—"}
                  </AdminTableCell>
                  <AdminTableCell className="text-zinc-500">
                    {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums font-medium text-zinc-900">
                    {row.orderCount}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums text-zinc-700">
                    {row.paidCount}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums font-medium text-zinc-900">
                    {currencyBRL(row.totalPaidCents)}
                  </AdminTableCell>
                  <AdminTableCell className="text-zinc-500">
                    {row.lastActivityAt
                      ? new Date(row.lastActivityAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(row);
                      }}
                    >
                      Ver
                    </button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          <CustomerDetailModal
            customer={
              selected
                ? {
                    id: selected.id,
                    name: selected.name,
                    email: selected.email,
                    phone: selected.phone,
                    createdAt: selected.createdAt,
                    orderCount: selected.orderCount,
                    paidCount: selected.paidCount,
                    totalPaidCents: selected.totalPaidCents,
                  }
                : null
            }
            orders={selected?.orders ?? []}
            onClose={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}
