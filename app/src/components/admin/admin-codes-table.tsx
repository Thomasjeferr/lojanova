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
import { AdminCodeEditModal, type EditableCodeRow } from "./admin-code-edit-modal";
import { Key, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CodeRow = {
  id: string;
  code: string;
  credentialType: "activation_code" | "username_password";
  username?: string | null;
  password?: string | null;
  planId: string;
  status: "available" | "sold" | "blocked";
  planTitle: string;
  orderEmail?: string;
  createdAt: string;
};

function maskCode(code: string) {
  if (code.length <= 8) return "••••••••";
  return code.slice(0, 4) + "••••••••" + code.slice(-4);
}

function maskUsername(username?: string | null) {
  const value = (username ?? "").trim();
  if (!value) return "—";
  if (value.length <= 4) return `${value[0] ?? ""}•••`;
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

function mapApiToRow(c: {
  id: string;
  code: string;
  credentialType: "activation_code" | "username_password";
  username?: string | null;
  password?: string | null;
  status: string;
  planId?: string;
  plan: { id: string; title: string };
  order?: { user?: { email?: string } };
  createdAt: string;
}): CodeRow {
  return {
    id: c.id,
    code: c.code,
    credentialType: c.credentialType,
    username: c.username,
    password: c.password ?? null,
    planId: c.plan?.id ?? c.planId ?? "",
    status: c.status as CodeRow["status"],
    planTitle: c.plan?.title ?? "",
    orderEmail: c.order?.user?.email,
    createdAt:
      typeof c.createdAt === "string" ? c.createdAt : new Date(c.createdAt).toISOString(),
  };
}

export function AdminCodesTable({
  initialCodes,
  plans,
}: {
  initialCodes: CodeRow[];
  plans: Array<{ id: string; title: string }>;
}) {
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPlan, setFilterPlan] = useState<string>("");
  const [editing, setEditing] = useState<EditableCodeRow | null>(null);
  const [deleting, setDeleting] = useState<CodeRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      fetch("/api/admin/codes", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (!d.codes) return;
          setCodes(d.codes.map(mapApiToRow));
        });
    }
    window.addEventListener("admin-codes-refresh", refresh);
    return () => window.removeEventListener("admin-codes-refresh", refresh);
  }, []);

  const plansSorted = plans.length
    ? [...plans].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
    : Array.from(new Set(codes.map((c) => c.planId))).map((id) => ({
        id,
        title: codes.find((c) => c.planId === id)?.planTitle ?? id,
      }));

  const filtered = codes.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPlan && c.planTitle !== filterPlan) return false;
    return true;
  });

  function dispatchListRefresh() {
    window.dispatchEvent(new CustomEvent("admin-codes-refresh"));
  }

  const canMutate = (row: CodeRow) =>
    row.status === "available" || row.status === "blocked";

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/codes/${deleting.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || "Não foi possível excluir.");
        return;
      }
      setDeleting(null);
      dispatchListRefresh();
    } catch {
      setDeleteError("Erro de conexão.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminCodeEditModal
        row={editing}
        plans={plansSorted}
        onClose={() => setEditing(null)}
        onSaved={dispatchListRefresh}
      />

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !deleteLoading && setDeleting(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900">Excluir código?</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Esta ação não pode ser desfeita. Apenas códigos disponíveis ou bloqueados sem venda
              podem ser removidos.
            </p>
            {deleteError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={deleteLoading}
                onClick={() => setDeleting(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteLoading}
                onClick={confirmDelete}
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
          {Array.from(new Set(codes.map((c) => c.planTitle)))
            .sort()
            .map((p) => (
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
            <AdminTableHeaderCell>Credencial</AdminTableHeaderCell>
            <AdminTableHeaderCell>Tipo</AdminTableHeaderCell>
            <AdminTableHeaderCell>Plano</AdminTableHeaderCell>
            <AdminTableHeaderCell>Status</AdminTableHeaderCell>
            <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
            <AdminTableHeaderCell>Data</AdminTableHeaderCell>
            <AdminTableHeaderCell className="w-[1%] whitespace-nowrap text-right">
              Ações
            </AdminTableHeaderCell>
          </AdminTableHead>
          <AdminTableBody>
            {filtered.map((row) => (
              <AdminTableRow key={row.id}>
                <AdminTableCell className="font-mono text-zinc-800">
                  {row.credentialType === "username_password"
                    ? `Usuario: ${maskUsername(row.username)}`
                    : maskCode(row.code)}
                </AdminTableCell>
                <AdminTableCell>
                  {row.credentialType === "username_password" ? "Usuario/Senha" : "Código"}
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
                <AdminTableCell className="text-right">
                  {canMutate(row) ? (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Editar"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600"
                        onClick={() =>
                          setEditing({
                            id: row.id,
                            code: row.code,
                            credentialType: row.credentialType,
                            username: row.username,
                            password: row.password,
                            planId: row.planId,
                            planTitle: row.planTitle,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        title="Excluir"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(row);
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
