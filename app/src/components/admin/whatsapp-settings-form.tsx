"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ContactSettingsForm = {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLabel: string;
  smsDeliveryEnabled: boolean;
};

export function WhatsAppSettingsForm({
  initial,
  disabled = false,
}: {
  initial: ContactSettingsForm;
  disabled?: boolean;
}) {
  const [form, setForm] = useState<ContactSettingsForm>(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const previewLink = useMemo(() => {
    return buildWhatsAppLink({
      number: form.whatsappNumber,
      message: form.whatsappMessage,
    });
  }, [form.whatsappMessage, form.whatsappNumber]);

  async function save() {
    if (disabled) return;
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings/contact", {
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
        whatsappEnabled: data.settings.whatsappEnabled,
        whatsappNumber: data.settings.whatsappNumber,
        whatsappMessage: data.settings.whatsappMessage,
        whatsappLabel: data.settings.whatsappLabel,
        smsDeliveryEnabled: data.settings.smsDeliveryEnabled ?? true,
      });
      setToast("ok");
      setToastMsg("Configurações de WhatsApp salvas com sucesso.");
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
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.whatsappEnabled}
            disabled={off}
            onChange={(e) => setForm((prev) => ({ ...prev, whatsappEnabled: e.target.checked }))}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/25 dark:border-zinc-600"
          />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Exibir botão flutuante de WhatsApp</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Quando ativo, o botão aparece automaticamente no frontend público.
            </p>
          </div>
        </label>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.smsDeliveryEnabled}
            disabled={off}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, smsDeliveryEnabled: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/25 dark:border-zinc-600"
          />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Entregar acesso por SMS (Twilio)</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Envia SMS com a credencial após pagamento confirmado (e na aprovação manual no admin).
              Requer variáveis Twilio de SMS no servidor. Desligue aqui para não enviar, mesmo com
              Twilio configurado.
            </p>
          </div>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
          <Input
            id="whatsappNumber"
            value={form.whatsappNumber}
            disabled={off}
            placeholder="(11) 99999-9999"
            onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
          />
          <p className="text-xs text-zinc-500">
            Será normalizado ao salvar (ex.: {normalizeWhatsAppNumber("11 99999-9999")}).
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappLabel">Texto do botão (tooltip/label)</Label>
          <Input
            id="whatsappLabel"
            value={form.whatsappLabel}
            disabled={off}
            placeholder="Fale conosco"
            onChange={(e) => setForm((prev) => ({ ...prev, whatsappLabel: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsappMessage">Mensagem pré-definida</Label>
        <textarea
          id="whatsappMessage"
          rows={3}
          disabled={off}
          value={form.whatsappMessage}
          onChange={(e) => setForm((prev) => ({ ...prev, whatsappMessage: e.target.value }))}
          placeholder="Olá! Quero saber mais sobre os planos."
          className="theme-focus-input w-full resize-y rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Preview do link gerado</p>
        <p className="mt-2 break-all text-xs text-zinc-500 dark:text-zinc-400">
          {previewLink || "Informe um número válido para gerar o link de preview."}
        </p>
      </div>

      <Button onClick={save} disabled={off}>
        {loading ? "Salvando..." : "Salvar configurações"}
      </Button>

      {toast && (
        <div
          role="status"
          className={
            toast === "ok"
              ? "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900 shadow-xl dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-100"
              : "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900 shadow-xl dark:border-red-500/35 dark:bg-red-950/50 dark:text-red-100"
          }
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

