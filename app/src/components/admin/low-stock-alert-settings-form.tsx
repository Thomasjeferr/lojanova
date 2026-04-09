"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDateTimePtBr } from "@/lib/brazil-time";

export type LowStockAlertSettingsFormState = {
  lowStockAlertEnabled: boolean;
  lowStockThreshold: number;
  lowStockNotifyEmail: string;
  lowStockAlertLastSentAt: string | null;
};

export function LowStockAlertSettingsForm({
  initial,
  disabled = false,
  fallbackNotifyEmailHint,
}: {
  initial: LowStockAlertSettingsFormState;
  disabled?: boolean;
  /** E-mail usado se o campo abaixo estiver vazio (ex.: ADMIN_EMAIL) */
  fallbackNotifyEmailHint?: string;
}) {
  const [form, setForm] = useState<LowStockAlertSettingsFormState>(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const lastSentLabel = form.lowStockAlertLastSentAt
    ? formatDateTimePtBr(form.lowStockAlertLastSentAt)
    : "—";

  async function save() {
    if (disabled) return;
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings/low-stock-alert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lowStockAlertEnabled: form.lowStockAlertEnabled,
          lowStockThreshold: form.lowStockThreshold,
          lowStockNotifyEmail: form.lowStockNotifyEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast("err");
        setToastMsg(data.error || "Não foi possível salvar.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        lowStockAlertEnabled: data.settings.lowStockAlertEnabled,
        lowStockThreshold: data.settings.lowStockThreshold,
        lowStockNotifyEmail: data.settings.lowStockNotifyEmail,
        lowStockAlertLastSentAt: data.settings.lowStockAlertLastSentAt,
      }));
      setToast("ok");
      setToastMsg(data.message || "Salvo.");
    } catch {
      setToast("err");
      setToastMsg("Erro de conexão.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setToast(null);
        setToastMsg("");
      }, 4200);
    }
  }

  const off = disabled || loading;

  return (
    <div className={cn("space-y-6", disabled && "opacity-60")}>
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.lowStockAlertEnabled}
            disabled={off}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lowStockAlertEnabled: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/25"
          />
          <div>
            <p className="font-medium text-zinc-900">Ativar alerta de estoque baixo</p>
            <p className="text-sm text-zinc-500">
              Um resumo por e-mail quando <strong>planos ativos</strong> tiverem quantidade de
              códigos <strong>disponíveis</strong> menor ou igual ao limite abaixo. Requer{" "}
              <code className="rounded bg-zinc-200/60 px-1 text-xs">RESEND_API_KEY</code> e job de
              cron (veja README).
            </p>
          </div>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lowStockThreshold">Limite global (disponíveis por plano)</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min={0}
            disabled={off}
            value={Number.isFinite(form.lowStockThreshold) ? form.lowStockThreshold : 0}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                lowStockThreshold: Number.parseInt(e.target.value, 10) || 0,
              }))
            }
          />
          <p className="text-xs text-zinc-500">
            Ex.: com limite 5, entram no alerta todos os planos ativos com até 5 códigos livres
            (inclui zero).
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lowStockNotifyEmail">E-mail do destinatário (opcional)</Label>
          <Input
            id="lowStockNotifyEmail"
            type="email"
            autoComplete="email"
            disabled={off}
            placeholder={fallbackNotifyEmailHint || "admin@exemplo.com"}
            value={form.lowStockNotifyEmail}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lowStockNotifyEmail: e.target.value }))
            }
          />
          <p className="text-xs text-zinc-500">
            Se vazio, usa{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs">ADMIN_EMAIL</code>
            {fallbackNotifyEmailHint ? (
              <>
                {" "}
                (<span className="break-all">{fallbackNotifyEmailHint}</span>)
              </>
            ) : (
              " do ambiente"
            )}
            .
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-600">
        Último envio registrado: <strong className="font-medium">{lastSentLabel}</strong>
        <span className="text-zinc-400">
          {" "}
          · O job na Vercel roda a cada 15 minutos; enquanto houver plano abaixo do limite, pode
          receber um novo e-mail a cada execução.
        </span>
      </p>

      <Button onClick={save} disabled={off}>
        {loading ? "Salvando..." : "Salvar alerta de estoque"}
      </Button>

      {toast && (
        <div
          role="status"
          className={
            toast === "ok"
              ? "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900 shadow-xl"
              : "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900 shadow-xl"
          }
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
