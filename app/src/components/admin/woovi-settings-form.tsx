"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WooviSettingsFormData = {
  paymentProvider: "woovi" | "ggpix";
  wooviApiKey: string;
  wooviWebhookSecret: string;
  ggpixApiKey: string;
  ggpixWebhookSecret: string;
};

export function WooviSettingsForm({
  initial,
  disabled = false,
}: {
  initial: WooviSettingsFormData;
  disabled?: boolean;
}) {
  const [form, setForm] = useState<WooviSettingsFormData>(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const isConfigured = useMemo(() => {
    if (form.paymentProvider === "ggpix") {
      return Boolean(form.ggpixApiKey.trim() && form.ggpixWebhookSecret.trim());
    }
    return Boolean(form.wooviApiKey.trim() && form.wooviWebhookSecret.trim());
  }, [
    form.paymentProvider,
    form.wooviApiKey,
    form.wooviWebhookSecret,
    form.ggpixApiKey,
    form.ggpixWebhookSecret,
  ]);

  async function save() {
    if (disabled) return;
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings/woovi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast("err");
        setToastMsg(data.error || "Não foi possível salvar.");
        return;
      }
      setForm({
        paymentProvider: data.settings.paymentProvider,
        wooviApiKey: data.settings.wooviApiKey,
        wooviWebhookSecret: data.settings.wooviWebhookSecret,
        ggpixApiKey: data.settings.ggpixApiKey,
        ggpixWebhookSecret: data.settings.ggpixWebhookSecret,
      });
      setToast("ok");
      setToastMsg("Credenciais da Woovi salvas com sucesso.");
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
      <div
        className={
          isConfigured
            ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            : "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        }
      >
        <p className="font-medium">
          Status da integração: {isConfigured ? "Configurada" : "Pendente"}
        </p>
        <p className="mt-1 text-xs opacity-90">
          {isConfigured
            ? "API Key e Webhook Secret preenchidos. O checkout Pix e o webhook podem operar normalmente."
            : "Preencha API Key e Webhook Secret para ativar cobrança Pix real e validação segura de webhook."}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="paymentProvider">Gateway ativo</Label>
          <select
            id="paymentProvider"
            value={form.paymentProvider}
            disabled={off}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                paymentProvider: e.target.value as "woovi" | "ggpix",
              }))
            }
            className="theme-focus-input w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900"
          >
            <option value="woovi">Woovi</option>
            <option value="ggpix">GGPIXAPI</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wooviApiKey">API Key da Woovi</Label>
          <Input
            id="wooviApiKey"
            value={form.wooviApiKey}
            disabled={off}
            placeholder="sua_api_key_da_woovi"
            onChange={(e) => setForm((prev) => ({ ...prev, wooviApiKey: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wooviWebhookSecret">Webhook Secret da Woovi</Label>
          <Input
            id="wooviWebhookSecret"
            value={form.wooviWebhookSecret}
            disabled={off}
            placeholder="seu_webhook_secret_da_woovi"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, wooviWebhookSecret: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ggpixApiKey">API Key da GGPIXAPI</Label>
          <Input
            id="ggpixApiKey"
            value={form.ggpixApiKey}
            disabled={off}
            placeholder="gk_sua_api_key"
            onChange={(e) => setForm((prev) => ({ ...prev, ggpixApiKey: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ggpixWebhookSecret">Webhook Secret da GGPIXAPI</Label>
          <Input
            id="ggpixWebhookSecret"
            value={form.ggpixWebhookSecret}
            disabled={off}
            placeholder="seu_webhook_secret_da_ggpix"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, ggpixWebhookSecret: e.target.value }))
            }
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Essas credenciais são usadas para gerar cobranças Pix e validar webhooks no ambiente online.
      </p>

      <Button onClick={save} disabled={off}>
        {loading ? "Salvando..." : "Salvar credenciais Woovi"}
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
