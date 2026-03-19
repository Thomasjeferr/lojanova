"use client";

import { useState, useEffect } from "react";
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
import { Key } from "lucide-react";

type CodeRow = {
  id: string;
  code: string;
  status: "available" | "sold" | "blocked";
  planTitle: string;
  orderEmail?: string;
  createdAt: string;
};

function maskCode(code: string) {
  if (code.length <= 8) return "••••••••";
  return code.slice(0, 4) + "••••••••" + code.slice(-4);
}

export function AdminCodesTable({ initialCodes }: { initialCodes: CodeRow[] }) {
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPlan, setFilterPlan] = useState<string>("");

  useEffect(() => {
    function refresh() {
      fetch("/api/admin/codes")
        .then((r) => r.json())
        .then((d) => {
          if (!d.codes) return;
          setCodes(
            d.codes.map(
              (c: {
                id: string;
                code: string;
                status: string;
                plan: { title: string };
                order?: { user?: { email?: string } };
                createdAt: string;
              }) => ({
                id: c.id,
                code: c.code,
                status: c.status,
                planTitle: c.plan?.title ?? "",
                orderEmail: c.order?.user?.email,
                createdAt:
                  typeof c.createdAt === "string"
                    ? c.createdAt
                    : new Date(c.createdAt).toISOString(),
              }),
            ),
          );
        });
    }
    window.addEventListener("admin-codes-refresh", refresh);
    return () => window.removeEventListener("admin-codes-refresh", refresh);
  }, []);

  const plans = Array.from(new Set(codes.map((c) => c.planTitle))).sort();
  const filtered = codes.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPlan && c.planTitle !== filterPlan) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="filter-status">
          Filtrar por status
        </label>
        <select
          id="filter-status"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="available">Disponível</option>
          <option value="sold">Vendido</option>
          <option value="blocked">Bloqueado</option>
        </select>
        <label className="sr-only" htmlFor="filter-plan">
          Filtrar por plano
        </label>
        <select
          id="filter-plan"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="">Todos os planos</option>
          {plans.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Key}
          title="Nenhum código encontrado"
          description="Importe códigos acima ou ajuste os filtros."
        />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <AdminTableHeaderCell>Código</AdminTableHeaderCell>
            <AdminTableHeaderCell>Plano</AdminTableHeaderCell>
            <AdminTableHeaderCell>Status</AdminTableHeaderCell>
            <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
            <AdminTableHeaderCell>Data</AdminTableHeaderCell>
          </AdminTableHead>
          <AdminTableBody>
            {filtered.map((row) => (
              <AdminTableRow key={row.id}>
                <AdminTableCell className="font-mono text-zinc-800">
                  {maskCode(row.code)}
                </AdminTableCell>
                <AdminTableCell>{row.planTitle}</AdminTableCell>
                <AdminTableCell>
                  <StatusBadge status={row.status} />
                </AdminTableCell>
                <AdminTableCell className="text-zinc-600">
                  {row.orderEmail ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-zinc-500">
                  {new Date(row.createdAt).toLocaleDateString("pt-BR")}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
