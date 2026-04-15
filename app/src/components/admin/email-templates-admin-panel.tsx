"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/admin/section-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import type { EmailTestTemplateKey } from "@/lib/email";

type TemplateRow = {
  key: EmailTestTemplateKey;
  internalId: string;
  name: string;
  description: string;
  trigger: string;
};

type MetaResponse = {
  templates: TemplateRow[];
  resendConfigured: boolean;
  fromConfigured: boolean;
  storeNameFromEnv: boolean;
};

export function EmailTemplatesAdminPanel() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTestTemplateKey>("activation");
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/emails", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setLoadError(data.error || "Não foi possível carregar os templates.");
          return;
        }
        if (!cancelled) {
          setMeta(data as MetaResponse);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("Erro de rede ao carregar.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!to.trim()) {
      setFeedback({ type: "err", text: "Informe o e-mail de destino." });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/emails/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, to: to.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({
          type: "err",
          text: data.error || "Falha ao enviar. Verifique RESEND_API_KEY e RESEND_FROM na Vercel.",
        });
        return;
      }
      setFeedback({
        type: "ok",
        text:
          data.message ||
          "E-mail enviado. O assunto começa com [TESTE] para você distinguir na caixa de entrada.",
      });
    } catch {
      setFeedback({ type: "err", text: "Erro de conexão ao enviar." });
    } finally {
      setSending(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-100">
        {loadError}
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        Carregando templates…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!meta.resendConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          <strong>RESEND_API_KEY</strong> não está definida neste ambiente. Configure na Vercel (ou{" "}
          <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/60">.env</code> local) e faça redeploy.
        </div>
      )}

      {!meta.fromConfigured && meta.resendConfigured && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-500/35 dark:bg-sky-950/40 dark:text-sky-100">
          Opcional: defina <strong>RESEND_FROM</strong> com um remetente verificado (ex.:{" "}
          <code className="rounded bg-sky-100/80 px-1 dark:bg-sky-900/50">iPlay 5 Plus &lt;noreply@iplay5plus.app&gt;</code>
          ). Sem isso, o sistema usa um remetente padrão do código.
        </div>
      )}

      {!meta.storeNameFromEnv && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Dica: use <strong>EMAIL_STORE_NAME</strong> para o nome da loja nos assuntos e rodapés dos
          e-mails (senão usa o padrão “Loja Digital”).
        </p>
      )}

      <SectionCard
        title="Modelos automáticos (código)"
        subtitle="Os HTMLs vivem em email-templates.ts; aqui você só visualiza o propósito e testa o envio via Resend."
      >
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {meta.templates.map((t) => (
            <li
              key={t.key}
              className="flex flex-col gap-1 px-6 py-4 first:pt-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{t.name}</p>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{t.description}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Quando:</span> {t.trigger}
                </p>
                <p className="mt-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{t.internalId}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="Enviar e-mail de teste"
        subtitle="Usa dados fictícios e assunto com prefixo [TESTE]. Exige domínio/remetente válidos na Resend."
      >
        <form onSubmit={handleSendTest} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="tpl">Template</Label>
            <select
              id="tpl"
              value={template}
              onChange={(e) => setTemplate(e.target.value as EmailTestTemplateKey)}
              className="theme-focus-input w-full max-w-md rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {meta.templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-to">Enviar teste para</Label>
            <Input
              id="test-to"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="max-w-md"
            />
          </div>
          {feedback ? (
            <div
              className={
                feedback.type === "ok"
                  ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/45 dark:text-emerald-100"
                  : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-100"
              }
            >
              {feedback.text}
            </div>
          ) : null}
          <Button type="submit" disabled={sending || !meta.resendConfigured} className="gap-2">
            {sending ? (
              "Enviando…"
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar e-mail de teste
              </>
            )}
          </Button>
        </form>
      </SectionCard>

      <p className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-500">
        <Mail className="mt-0.5 h-4 w-4 shrink-0" />
        Edição do HTML dos templates ainda é feita no código (ou integração futura com templates
        hospedados na Resend).
      </p>
    </div>
  );
}
