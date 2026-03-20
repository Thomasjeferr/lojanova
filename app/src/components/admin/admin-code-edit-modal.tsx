"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EditableCodeRow = {
  id: string;
  code: string;
  credentialType: "activation_code" | "username_password";
  username?: string | null;
  password?: string | null;
  planId: string;
  planTitle: string;
};

export function AdminCodeEditModal({
  row,
  plans,
  onClose,
  onSaved,
}: {
  row: EditableCodeRow | null;
  plans: Array<{ id: string; title: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [planId, setPlanId] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!row) return;
    setPlanId(row.planId);
    setActivationCode(
      row.credentialType === "activation_code" ? row.code.replace(/\s+/g, "").toUpperCase() : "",
    );
    setUsername(row.username ?? "");
    setPassword(row.password ?? "");
    setShowPassword(false);
    setError(null);
  }, [row]);

  if (!row) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const current = row;
    if (!current) return;
    setLoading(true);
    setError(null);
    const body: Record<string, string> = {};
    if (planId !== current.planId) body.planId = planId;
    if (current.credentialType === "activation_code") {
      const next = activationCode.replace(/\s+/g, "").toUpperCase();
      if (next && next !== current.code) body.code = next;
    } else {
      if (username !== (current.username ?? "") || password !== (current.password ?? "")) {
        body.username = username;
        body.password = password;
      }
    }
    if (Object.keys(body).length === 0) {
      setLoading(false);
      setError("Nenhuma alteração para salvar.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/codes/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Editar código</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-plan">Plano</Label>
            <select
              id="edit-plan"
              className="theme-focus-input w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              disabled={loading}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {row.credentialType === "activation_code" ? (
            <div className="space-y-1.5">
              <Label htmlFor="edit-code">Código (16 caracteres)</Label>
              <Input
                id="edit-code"
                className="font-mono"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                maxLength={32}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-user">Usuário</Label>
                <Input
                  id="edit-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-pass">Senha</Label>
                <div className="relative">
                  <Input
                    id="edit-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-40"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
