"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Key, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateShortPtBr } from "@/lib/brazil-time";

export type AdminPlanOption = { id: string; title: string; durationDays: number };

export type CodeRow = {
  id: string;
  code: string;
  credentialType: "activation_code" | "username_password";
  username?: string | null;
  password?: string | null;
  planId: string;
  status: "available" | "reserved" | "sold" | "blocked";
  planTitle: string;
  /** Vem do cadastro do plano — distingue 30/31/90 dias quando o título é genérico (“Recarga”). */
  planDurationDays: number;
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
  plan: { id: string; title: string; durationDays: number };
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
    planDurationDays: c.plan?.durationDays ?? 0,
    orderEmail: c.order?.user?.email,
    createdAt:
      typeof c.createdAt === "string" ? c.createdAt : new Date(c.createdAt).toISOString(),
  };
}

function planLabel(p: { title: string; durationDays: number }) {
  return `${p.title} · ${p.durationDays} dias`;
}

export function AdminCodesTable({
  initialCodes,
  plans,
}: {
  initialCodes: CodeRow[];
  plans: AdminPlanOption[];
}) {
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [filterStatus, setFilterStatus] = useState<string>("");
  /** Filtro por id do plano (evita ambiguidade quando vários planos têm o mesmo título). */
  const [filterPlanId, setFilterPlanId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [editing, setEditing] = useState<EditableCodeRow | null>(null);
  const [deleting, setDeleting] = useState<CodeRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setSearchQ(searchInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const loadCodes = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterPlanId) params.set("planId", filterPlanId);
      if (searchQ) params.set("q", searchQ);
      const r = await fetch(`/api/admin/codes?${params.toString()}`, { credentials: "include" });
      const d = (await r.json()) as { codes?: unknown[] };
      if (d.codes) {
        setCodes(
          d.codes.map((c) => mapApiToRow(c as Parameters<typeof mapApiToRow>[0])),
        );
      }
    } finally {
      setListLoading(false);
    }
  }, [filterStatus, filterPlanId, searchQ]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  useEffect(() => {
    const onRefresh = () => void loadCodes();
    window.addEventListener("admin-codes-refresh", onRefresh);
    return () => window.removeEventListener("admin-codes-refresh", onRefresh);
  }, [loadCodes]);

  const plansSorted = plans.length
    ? [...plans].sort((a, b) => a.durationDays - b.durationDays || a.title.localeCompare(b.title, "pt-BR"))
    : Array.from(new Map(codes.map((c) => [c.planId, c])).values()).map((c) => ({
        id: c.planId,
        title: c.planTitle,
        durationDays: c.planDurationDays,
      }));

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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[min(100%,320px)] flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            id="codes-search"
            type="search"
            autoComplete="off"
            placeholder="Buscar por usuário, código ou e-mail do cliente…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-xl border-zinc-200 py-2.5 pl-10 pr-10 text-sm"
            aria-busy={listLoading}
          />
          {listLoading ? (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400"
              aria-hidden
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="filter-status">
            Filtrar por status
          </label>
          <select
            id="filter-status"
            disabled={listLoading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="available">Disponível</option>
            <option value="reserved">Reservado (Pix)</option>
            <option value="sold">Vendido</option>
            <option value="blocked">Bloqueado</option>
          </select>
          <label className="sr-only" htmlFor="filter-plan">
            Filtrar por plano
          </label>
          <select
            id="filter-plan"
            disabled={listLoading}
            className="min-w-[min(100%,280px)] rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            value={filterPlanId}
            onChange={(e) => setFilterPlanId(e.target.value)}
          >
            <option value="">Todos os planos</option>
            {plansSorted.map((p) => (
              <option key={p.id} value={p.id}>
                {planLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {codes.length === 0 && listLoading ? (
        <p className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          Carregando lista…
        </p>
      ) : codes.length === 0 && !listLoading ? (
        <EmptyState
          icon={Key}
          title="Nenhum código encontrado"
          description={
            searchQ
              ? "Nada corresponde à busca. Tente outro trecho de usuário, código ou e-mail."
              : "Importe códigos acima ou ajuste os filtros."
          }
        />
      ) : codes.length > 0 ? (
        <AdminTable>
          <AdminTableHead>
            <AdminTableHeaderCell>Credencial</AdminTableHeaderCell>
            <AdminTableHeaderCell>Tipo</AdminTableHeaderCell>
            <AdminTableHeaderCell>Plano</AdminTableHeaderCell>
            <AdminTableHeaderCell>Status</AdminTableHeaderCell>
            <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
            <AdminTableHeaderCell>Cadastro</AdminTableHeaderCell>
            <AdminTableHeaderCell className="w-[1%] whitespace-nowrap text-right">
              Ações
            </AdminTableHeaderCell>
          </AdminTableHead>
          <AdminTableBody>
            {codes.map((row) => (
              <AdminTableRow key={row.id}>
                <AdminTableCell className="font-mono text-zinc-800">
                  {row.credentialType === "username_password"
                    ? `Usuario: ${maskUsername(row.username)}`
                    : maskCode(row.code)}
                </AdminTableCell>
                <AdminTableCell>
                  {row.credentialType === "username_password" ? "Usuario/Senha" : "Código"}
                </AdminTableCell>
                <AdminTableCell className="max-w-[220px]">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-zinc-900">{row.planTitle}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                      {row.planDurationDays} dias de acesso
                    </p>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <StatusBadge status={row.status} />
                </AdminTableCell>
                <AdminTableCell className="text-zinc-600">
                  {row.orderEmail ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-zinc-500">
                  {formatDateShortPtBr(row.createdAt)}
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
      ) : null}
    </div>
  );
}
