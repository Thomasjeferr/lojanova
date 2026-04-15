"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, QrCode, Send, Smartphone } from "lucide-react";
import {
  DEFAULT_EVOLUTION_DELIVERY_TEMPLATE,
  DEFAULT_EVOLUTION_RECOVERY_TEMPLATE,
} from "@/lib/evolution-messages";

export type EvolutionMessagingInitial = {
  evolutionDeliveryEnabled: boolean;
  evolutionDeliveryTemplate: string;
  evolutionRecoveryEnabled: boolean;
  evolutionRecoveryTemplate: string;
  evolutionRecoveryAfterMinutes: number;
};

export function EvolutionWhatsAppSettings({
  initial,
  disabled = false,
}: {
  initial: EvolutionMessagingInitial;
  disabled?: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{
    envConfigured: boolean;
    instanceName: string | null;
    connectionState: string | null;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<{
    base64: string | null;
    pairingCode: string | null;
    connected: boolean;
    state: string | null;
  } | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState<"delivery" | "recovery" | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const r = await fetch("/api/admin/evolution/status", { credentials: "include" });
      const d = (await r.json()) as {
        envConfigured?: boolean;
        instanceName?: string | null;
        connectionState?: string | null;
      };
      if (r.ok) {
        setStatus({
          envConfigured: Boolean(d.envConfigured),
          instanceName: d.instanceName ?? null,
          connectionState: d.connectionState ?? null,
        });
      }
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const refreshQr = useCallback(async () => {
    setQrError(null);
    try {
      const r = await fetch("/api/admin/evolution/connect", { credentials: "include" });
      const d = (await r.json()) as {
        error?: string;
        base64?: string | null;
        pairingCode?: string | null;
        connected?: boolean;
        state?: string | null;
      };
      if (!r.ok) {
        setQrError(d.error || "Não foi possível carregar o QR.");
        return;
      }
      setQrData({
        base64: d.base64 ?? null,
        pairingCode: d.pairingCode ?? null,
        connected: Boolean(d.connected),
        state: d.state ?? null,
      });
      if (d.connected) {
        void loadStatus();
      }
    } catch {
      setQrError("Erro de conexão ao buscar QR.");
    }
  }, [loadStatus]);

  useEffect(() => {
    if (!qrOpen) return;
    void refreshQr();
    const id = window.setInterval(() => void refreshQr(), 4500);
    return () => window.clearInterval(id);
  }, [qrOpen, refreshQr]);

  async function createInstance() {
    if (disabled) return;
    setActionLoading(true);
    setToast(null);
    try {
      const r = await fetch("/api/admin/evolution/instance", {
        method: "POST",
        credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) {
        setToast("err");
        setToastMsg(d.error || "Não foi possível criar a instância.");
        return;
      }
      setToast("ok");
      setToastMsg(d.message || "Instância criada.");
      await loadStatus();
    } catch {
      setToast("err");
      setToastMsg("Erro de conexão.");
    } finally {
      setActionLoading(false);
      setTimeout(() => {
        setToast(null);
        setToastMsg("");
      }, 4000);
    }
  }

  async function sendTest(kind: "delivery" | "recovery") {
    if (disabled) return;
    const phone = testPhone.trim();
    if (!phone) {
      setToast("err");
      setToastMsg("Informe o telefone para receber o teste.");
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setTestSending(kind);
    setToast(null);
    try {
      const r = await fetch("/api/admin/evolution/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone,
          kind,
          deliveryTemplate: form.evolutionDeliveryTemplate,
          recoveryTemplate: form.evolutionRecoveryTemplate,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setToast("err");
        setToastMsg(d.error || "Não foi possível enviar o teste.");
        return;
      }
      setToast("ok");
      setToastMsg(d.message || "Teste enviado.");
    } catch {
      setToast("err");
      setToastMsg("Erro de conexão.");
    } finally {
      setTestSending(null);
      setTimeout(() => {
        setToast(null);
        setToastMsg("");
      }, 5000);
    }
  }

  async function saveMessaging() {
    if (disabled) return;
    setActionLoading(true);
    setToast(null);
    try {
      const r = await fetch("/api/admin/evolution/messaging", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) {
        setToast("err");
        setToastMsg(d.error || "Não foi possível salvar.");
        return;
      }
      if (d.settings) {
        setForm({
          evolutionDeliveryEnabled: d.settings.evolutionDeliveryEnabled ?? false,
          evolutionDeliveryTemplate: d.settings.evolutionDeliveryTemplate ?? "",
          evolutionRecoveryEnabled: d.settings.evolutionRecoveryEnabled ?? false,
          evolutionRecoveryTemplate: d.settings.evolutionRecoveryTemplate ?? "",
          evolutionRecoveryAfterMinutes: d.settings.evolutionRecoveryAfterMinutes ?? 60,
        });
      }
      setToast("ok");
      setToastMsg(d.message || "Salvo.");
    } catch {
      setToast("err");
      setToastMsg("Erro de conexão.");
    } finally {
      setActionLoading(false);
      setTimeout(() => {
        setToast(null);
        setToastMsg("");
      }, 4000);
    }
  }

  const off = disabled || actionLoading;
  const testOff = disabled || testSending !== null;
  const connected = status?.connectionState?.toLowerCase() === "open";

  return (
    <div className={cn("space-y-6", disabled && "opacity-60")}>
      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Conexão Evolution (VPS)</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Variáveis na Vercel:{" "}
                <code className="rounded bg-zinc-100 px-1 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  EVOLUTION_API_URL
                </code>{" "}
                e{" "}
                <code className="rounded bg-zinc-100 px-1 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  EVOLUTION_API_KEY
                </code>
                .
              </p>
              {statusLoading ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Verificando…
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>
                    <span className="text-zinc-600 dark:text-zinc-400">Env:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {status?.envConfigured ? "configurado" : "faltando URL ou chave"}
                    </span>
                  </li>
                  <li>
                    <span className="text-zinc-600 dark:text-zinc-400">Instância:</span>{" "}
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                      {status?.instanceName || "—"}
                    </span>
                  </li>
                  <li>
                    <span className="text-zinc-600 dark:text-zinc-400">Estado:</span>{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {status?.connectionState || "—"}
                      {connected ? " (pronto para enviar)" : ""}
                    </span>
                  </li>
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!status?.instanceName ? (
              <Button
                type="button"
                disabled={off || !status?.envConfigured}
                onClick={() => void createInstance()}
              >
                {actionLoading ? "Criando…" : "Criar instância"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={off}
                onClick={() => {
                  setQrOpen(true);
                  setQrData(null);
                }}
              >
                <QrCode className="mr-2 h-4 w-4" aria-hidden />
                Exibir QR / reconectar
              </Button>
            )}
            <Button type="button" variant="ghost" disabled={statusLoading} onClick={() => void loadStatus()}>
              Atualizar status
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.evolutionDeliveryEnabled}
            disabled={off}
            onChange={(e) =>
              setForm((p) => ({ ...p, evolutionDeliveryEnabled: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/25"
          />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Enviar acesso por WhatsApp após pagamento
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Só envia se a instância estiver conectada (estado open) e o cliente tiver telefone
              válido no cadastro.
            </p>
          </div>
        </label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evo-delivery-template">Template — pagamento aprovado</Label>
        <textarea
          id="evo-delivery-template"
          rows={4}
          disabled={off}
          value={form.evolutionDeliveryTemplate}
          onChange={(e) =>
            setForm((p) => ({ ...p, evolutionDeliveryTemplate: e.target.value }))
          }
          placeholder={DEFAULT_EVOLUTION_DELIVERY_TEMPLATE}
          className="theme-focus-input w-full resize-y rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Variáveis: {"{firstName}"}, {"{storeName}"}, {"{planName}"}, {"{validityLabel}"},{" "}
          {"{credentialLabel}"}, {"{credentialValue}"}, {"{accountUrl}"}.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.evolutionRecoveryEnabled}
            disabled={off}
            onChange={(e) =>
              setForm((p) => ({ ...p, evolutionRecoveryEnabled: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/25"
          />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Lembrete automático (pedido em aberto)</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Cron na Vercel a cada 10 min. Uma mensagem por pedido. Requer{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                CRON_SECRET
              </code>
              .
            </p>
          </div>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="evo-recovery-min">Minutos após o pedido para enviar o lembrete</Label>
          <Input
            id="evo-recovery-min"
            type="number"
            min={15}
            max={10080}
            disabled={off || !form.evolutionRecoveryEnabled}
            value={form.evolutionRecoveryAfterMinutes}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                evolutionRecoveryAfterMinutes: Number(e.target.value) || 60,
              }))
            }
            className="rounded-xl border-zinc-200"
          />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Entre 15 min e 7 dias (10080 min).</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="evo-recovery-template">Template — recuperação de venda</Label>
        <textarea
          id="evo-recovery-template"
          rows={4}
          disabled={off || !form.evolutionRecoveryEnabled}
          value={form.evolutionRecoveryTemplate}
          onChange={(e) =>
            setForm((p) => ({ ...p, evolutionRecoveryTemplate: e.target.value }))
          }
          placeholder={DEFAULT_EVOLUTION_RECOVERY_TEMPLATE}
          className="theme-focus-input w-full resize-y rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Variáveis: {"{firstName}"}, {"{storeName}"}, {"{orderNumber}"}, {"{planName}"},{" "}
          {"{accountUrl}"}.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 dark:border-blue-500/25 dark:bg-blue-950/35">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Envio de teste</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Usa os textos dos campos acima (mesmo sem clicar em Salvar). Não exige ativar o envio
          automático. A mensagem começa com{" "}
          <span className="font-mono text-xs">[TESTE LOJA]</span> e dados fictícios nos placeholders.
        </p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="evo-test-phone">Telefone (recebe o WhatsApp)</Label>
            <Input
              id="evo-test-phone"
              type="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              disabled={testOff}
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="max-w-sm rounded-xl border-zinc-200"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={testOff || !status?.envConfigured || !connected}
              onClick={() => void sendTest("delivery")}
              title={
                !connected
                  ? "Conecte o WhatsApp (estado open) antes de testar."
                  : undefined
              }
            >
              {testSending === "delivery" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  Testar template de aprovação
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={testOff || !status?.envConfigured || !connected}
              onClick={() => void sendTest("recovery")}
            >
              {testSending === "recovery" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  Testar template de recuperação
                </>
              )}
            </Button>
          </div>
          {!status?.envConfigured ? (
            <p className="text-xs text-amber-900 dark:text-amber-100">
              Configure as variáveis Evolution no .env local ou na Vercel.
            </p>
          ) : !connected ? (
            <p className="text-xs text-amber-900 dark:text-amber-100">
              Pareie o WhatsApp (estado <span className="font-mono">open</span>) para habilitar os testes.
            </p>
          ) : null}
        </div>
      </div>

      <Button onClick={() => void saveMessaging()} disabled={off}>
        {actionLoading ? "Salvando…" : "Salvar mensagens e opções"}
      </Button>

      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !actionLoading && setQrOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl dark:border-zinc-700/90 dark:bg-zinc-900 dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Parear WhatsApp</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho → escaneie o
              QR. O código renova; esta tela atualiza sozinha.
            </p>
            {qrError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-100">
                {qrError}
              </p>
            )}
            {qrData?.connected ? (
              <p className="mt-6 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Conectado ({qrData.state}). Você pode fechar esta janela.
              </p>
            ) : qrData?.base64 ? (
              <div className="mt-6 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrData.base64.startsWith("data:") ? qrData.base64 : `data:image/png;base64,${qrData.base64}`}
                  alt="QR Code WhatsApp"
                  className="max-w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
                />
              </div>
            ) : (
              <p className="mt-6 flex justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Carregando QR…
              </p>
            )}
            {qrData?.pairingCode ? (
              <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                Código de pareamento:{" "}
                <span className="font-mono font-semibold">{qrData.pairingCode}</span>
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => void refreshQr()}>
                Atualizar QR
              </Button>
              <Button type="button" onClick={() => setQrOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={
            toast === "ok"
              ? "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900 shadow-xl dark:border-emerald-500/30 dark:bg-emerald-950/90 dark:text-emerald-100"
              : "fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-900 shadow-xl dark:border-red-500/30 dark:bg-red-950/90 dark:text-red-100"
          }
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
