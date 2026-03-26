"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CopyButton } from "@/components/account/copy-button";
import { copyOrderNumber, displayOrderNumber } from "@/lib/order-ref";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { OrderDetailModal, type OrderRow } from "./order-detail-modal";

export type { OrderRow };

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;

function matchesOrderSearch(row: OrderRow, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  const numStr = String(row.orderNumber);
  return (
    numStr.includes(n.replace(/^#/, "")) ||
    row.id.toLowerCase().includes(n) ||
    row.userEmail.toLowerCase().includes(n) ||
    row.userName.toLowerCase().includes(n)
  );
}

export function AdminOrdersTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    // Mantém admin próximo de tempo real sem interação manual.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 10000);
    return () => clearInterval(id);
  }, [router]);

  async function handleApprove(row: OrderRow) {
    const isResend = row.hasDelivery === true;
    if (
      !window.confirm(
        isResend
          ? `Reenviar e-mail e SMS para ${row.userEmail} com o acesso?`
          : `Aprovar manualmente o pedido ${displayOrderNumber(row.orderNumber)}? Um código será reservado, o pedido será marcado como pago e o cliente receberá e-mail e SMS.`,
      )
    ) {
      return;
    }
    setApprovingId(row.id);
    setActionBanner(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(row.id)}/approve`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        order?: { status: string; paidAt: string | null; code?: string };
      };
      if (!res.ok) {
        setActionBanner({ type: "err", text: data.error || "Falha ao processar" });
        return;
      }
      setActionBanner({ type: "ok", text: data.message || "Concluído." });
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === row.id
              ? {
                  ...o,
                  status: data.order!.status,
                  paidAt: data.order!.paidAt ?? o.paidAt,
                  code: data.order!.code ?? o.code,
                  hasDelivery: true,
                }
              : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev && prev.id === row.id
            ? {
                ...prev,
                status: data.order!.status,
                paidAt: data.order!.paidAt ?? prev.paidAt,
                code: data.order!.code ?? prev.code,
                hasDelivery: true,
              }
            : prev,
        );
      }
      router.refresh();
    } catch {
      setActionBanner({ type: "err", text: "Erro de rede." });
    } finally {
      setApprovingId(null);
    }
  }

  async function handleCancel(row: OrderRow) {
    if (row.status === "paid") {
      setActionBanner({
        type: "err",
        text: "Pedido pago não pode ser cancelado por esta ação.",
      });
      return;
    }
    if (
      !window.confirm(
        `Cancelar o pedido ${displayOrderNumber(row.orderNumber)}? Se houver código reservado, ele voltará ao estoque.`,
      )
    ) {
      return;
    }
    setCancellingId(row.id);
    setActionBanner(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(row.id)}/cancel`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        order?: { status: string; paidAt: string | null; code?: string | null };
      };
      if (!res.ok) {
        setActionBanner({ type: "err", text: data.error || "Falha ao cancelar pedido" });
        return;
      }
      setActionBanner({ type: "ok", text: data.message || "Pedido cancelado." });
      if (data.order) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === row.id
              ? {
                  ...o,
                  status: data.order!.status,
                  paidAt: data.order!.paidAt ?? o.paidAt,
                  code: undefined,
                }
              : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev && prev.id === row.id
            ? {
                ...prev,
                status: data.order!.status,
                paidAt: data.order!.paidAt ?? prev.paidAt,
                code: undefined,
              }
            : prev,
        );
      }
      router.refresh();
    } catch {
      setActionBanner({ type: "err", text: "Erro de rede." });
    } finally {
      setCancellingId(null);
    }
  }

  const filtered = useMemo(() => {
    let list = orders.filter((o) => matchesOrderSearch(o, search));
    if (filterStatus) {
      list = list.filter((o) => o.status === filterStatus);
    }
    return list;
  }, [orders, search, filterStatus]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, pageSize]);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <label className="sr-only" htmlFor="order-search">
          Buscar pedido
        </label>
        <input
          id="order-search"
          type="search"
          placeholder="Nº do pedido, e-mail ou nome do cliente…"
          className="min-w-[220px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <span className="whitespace-nowrap">Por página</span>
          <select
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Pedidos por página"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Link
          href="/admin/customers"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Ver clientes
        </Link>
      </div>

      {actionBanner ? (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionBanner.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {actionBanner.text}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={orders.length === 0 ? "Nenhum pedido" : "Nenhum resultado"}
          description={
            orders.length === 0
              ? "Os pedidos aparecerão aqui quando os clientes comprarem."
              : "Tente outro termo ou altere o status."
          }
          action={
            orders.length === 0 ? (
              <Link
                href="/"
                className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Ver site
              </Link>
            ) : undefined
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
              {filtered.length === 1 ? "pedido" : "pedidos"}
              {filtered.length !== orders.length ? (
                <span className="text-zinc-400">
                  {" "}
                  (filtro sobre {orders.length} no total)
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
              <AdminTableHeaderCell className="min-w-[7rem]">
                Nº pedido
              </AdminTableHeaderCell>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Plano</AdminTableHeaderCell>
              <AdminTableHeaderCell>Valor</AdminTableHeaderCell>
              <AdminTableHeaderCell>Status</AdminTableHeaderCell>
              <AdminTableHeaderCell>Data</AdminTableHeaderCell>
              <AdminTableHeaderCell>Código</AdminTableHeaderCell>
              <AdminTableHeaderCell className="min-w-[9.5rem]">Ações</AdminTableHeaderCell>
            </AdminTableHead>
            <AdminTableBody>
              {paginated.map((row) => (
                <AdminTableRow
                  key={row.id}
                  onClick={() => setSelectedOrder(row)}
                >
                  <AdminTableCell className="align-top">
                    <p className="text-base font-bold tabular-nums text-zinc-900">
                      {displayOrderNumber(row.orderNumber)}
                    </p>
                    <div
                      className="mt-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CopyButton
                        value={copyOrderNumber(row.orderNumber)}
                        label="Copiar nº"
                        variant="outline"
                        className="!px-2 !py-1 text-xs"
                      />
                    </div>
                  </AdminTableCell>
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
                    {formatDateTimePtBr(row.createdAt)}
                  </AdminTableCell>
                  <AdminTableCell className="font-mono text-xs text-zinc-600">
                    {row.code
                      ? row.code.replace(/\n/g, " / ").slice(0, 28) + "…"
                      : "—"}
                  </AdminTableCell>
                  <AdminTableCell className="align-top">
                    <div
                      className="flex flex-col gap-1.5"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      {row.status !== "cancelled" ? (
                        <button
                          type="button"
                          disabled={approvingId === row.id}
                          onClick={() => void handleApprove(row)}
                          className="text-left text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {approvingId === row.id
                            ? "Processando…"
                            : row.hasDelivery
                              ? "Reenviar"
                              : "Aprovar"}
                        </button>
                      ) : null}
                      {row.status !== "cancelled" && row.status !== "paid" ? (
                        <button
                          type="button"
                          disabled={cancellingId === row.id}
                          onClick={() => void handleCancel(row)}
                          className="text-left text-sm font-semibold text-red-700 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === row.id ? "Cancelando…" : "Cancelar"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-left text-sm font-medium text-blue-600 hover:text-blue-700"
                        onClick={() => setSelectedOrder(row)}
                      >
                        Ver
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>

          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            approvingId={approvingId}
            onApprove={handleApprove}
            cancellingId={cancellingId}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  );
}
