"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUCTION_PUBLIC_SITE_URL } from "@/lib/public-site-url";

type WooviSettingsFormData = {
  paymentProvider: "woovi" | "ggpix";
  wooviApiKey: string;
  wooviWebhookSecret: string;
  ggpixApiKey: string;
  ggpixWebhookSecret: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function WooviSettingsForm({
  initial,
  publicBaseUrl = PRODUCTION_PUBLIC_SITE_URL,
  disabled = false,
}: {
  initial: WooviSettingsFormData;
  /** URL pública do site (ex.: variável APP_URL). Usada para montar a URL do webhook nas instruções. */
  publicBaseUrl?: string;
  disabled?: boolean;
}) {
  const [form, setForm] = useState<WooviSettingsFormData>(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<"ok" | "err" | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const gatewayLabel = form.paymentProvider === "ggpix" ? "GGPIXAPI" : "Woovi";

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
      const savedLabel =
        data.settings.paymentProvider === "ggpix" ? "GGPIXAPI" : "Woovi";
      setToastMsg(`Credenciais ${savedLabel} salvas com sucesso.`);
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
  const base = normalizeBaseUrl(publicBaseUrl.trim() || PRODUCTION_PUBLIC_SITE_URL);
  const ggpixWebhookUrl = `${base}/api/ggpix/webhook`;
  const wooviWebhookUrl = `${base}/api/woovi/webhook`;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

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
          Gateway ativo: {gatewayLabel} · Status: {isConfigured ? "Configurada" : "Pendente"}
        </p>
        <p className="mt-1 text-xs opacity-90">
          {isConfigured
            ? `Credenciais de ${gatewayLabel} preenchidas. O checkout Pix e o webhook podem operar normalmente.`
            : `Preencha API Key e Webhook Secret de ${gatewayLabel} para ativar cobrança Pix real e validação segura de webhook.`}
        </p>
      </div>

      {form.paymentProvider === "ggpix" ? (
        <div className="space-y-3 rounded-2xl border border-violet-200/80 bg-violet-50/60 p-4 sm:p-5">
          <p className="text-sm font-semibold text-violet-950">
            Como configurar no painel GGPIXAPI (Credenciais e Webhooks)
          </p>
          <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-zinc-700">
            <li>
              Acesse o painel da GGPIXAPI e abra <strong>Credenciais e Webhooks</strong> → aba{" "}
              <strong>Webhooks</strong> → <strong>Configuração</strong>.
            </li>
            <li>
              Em <strong>URL do Webhook</strong>, cole exatamente esta URL (HTTPS):
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <code className="break-all rounded-lg bg-white px-2 py-1 text-xs text-zinc-900 ring-1 ring-zinc-200">
                  {ggpixWebhookUrl}
                </code>
                <button
                  type="button"
                  disabled={off}
                  onClick={() => copyText(ggpixWebhookUrl)}
                  className="rounded-lg border border-violet-300 bg-white px-2 py-1 text-xs font-medium text-violet-900 hover:bg-violet-100 disabled:opacity-50"
                >
                  Copiar URL
                </button>
              </div>
            </li>
            <li>
              Em <strong>Eventos</strong>, marque pelo menos <strong>PIX Recebido</strong> para
              confirmar pagamentos e liberar o código ao cliente.
            </li>
            <li>
              Em <strong>Autenticação</strong>, escolha <strong>HMAC Secret</strong> (assinatura no
              header <code className="rounded bg-white px-1">X-Webhook-Signature</code>). Evite{" "}
              <em>Sem autenticação</em> em produção.
            </li>
            <li>
              Gere ou defina o segredo no painel GGPIXAPI e cole <strong>o mesmo valor</strong> no
              campo <strong>Webhook Secret da GGPIXAPI</strong> abaixo. Depois clique em{" "}
              <strong>Salvar</strong> no painel GGPIXAPI e use <strong>Testar</strong> se disponível.
            </li>
            <li>
              A <strong>API Key</strong> vem das credenciais GGPIX (formato <code className="rounded bg-white px-1">gk_…</code>).
              Cole no campo <strong>API Key da GGPIXAPI</strong> e salve neste site.
            </li>
          </ol>
          <p className="text-xs text-zinc-600">
            URL base das instruções: <code className="rounded bg-white px-1">{base}</code>. Loja em
            produção:{" "}
            <a
              href={PRODUCTION_PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-800 underline underline-offset-2"
            >
              {PRODUCTION_PUBLIC_SITE_URL}
            </a>
            . Se <code className="rounded bg-white px-1">APP_URL</code> no servidor for outro domínio
            válido (não localhost), ele substitui automaticamente estas URLs.
          </p>
          <p className="text-xs text-zinc-600">
            Documentação oficial:{" "}
            <a
              href="https://ggpixapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-800 underline underline-offset-2 hover:text-violet-950"
            >
              ggpixapi.com
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 sm:p-5">
          <p className="text-sm font-semibold text-sky-950">Como configurar a Woovi (webhook)</p>
          <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-zinc-700">
            <li>
              No painel Woovi/OpenPix, configure o webhook apontando para:
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <code className="break-all rounded-lg bg-white px-2 py-1 text-xs text-zinc-900 ring-1 ring-zinc-200">
                  {wooviWebhookUrl}
                </code>
                <button
                  type="button"
                  disabled={off}
                  onClick={() => copyText(wooviWebhookUrl)}
                  className="rounded-lg border border-sky-300 bg-white px-2 py-1 text-xs font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50"
                >
                  Copiar URL
                </button>
              </div>
            </li>
            <li>
              Use o mesmo <strong>Webhook Secret</strong> configurado na Woovi no campo{" "}
              <strong>Webhook Secret da Woovi</strong> abaixo.
            </li>
          </ol>
          <p className="text-xs text-zinc-600">
            URL acima usa <code className="rounded bg-white px-1">{base}</code> — loja em produção:{" "}
            <a
              href={PRODUCTION_PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-900 underline underline-offset-2"
            >
              {PRODUCTION_PUBLIC_SITE_URL}
            </a>
            .
          </p>
        </div>
      )}

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
        {loading ? "Salvando..." : `Salvar credenciais ${gatewayLabel}`}
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
