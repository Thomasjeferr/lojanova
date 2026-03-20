"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CopyFeedbackButton } from "@/components/copy-feedback-button";
import { CopyButton } from "@/components/account/copy-button";
import { copyOrderNumber, displayOrderNumber } from "@/lib/order-ref";

export type CheckoutCredentialDetail = {
  type: "activation_code" | "username_password";
  kindLabel: string;
  activationCode: string | null;
  username: string | null;
  password: string | null;
};

type CredentialSuccessPanelProps = {
  /** Texto único para copiar (e-mail / área do cliente) */
  copyAllText: string;
  credential: CheckoutCredentialDetail | null;
  /** Pagamento confirmado mas credencial ainda não veio na API (webhook em andamento) */
  releasing?: boolean;
  /** Número curto do pedido (igual em Meus pedidos / suporte) */
  orderNumber?: number;
};

function OrderNumberBlock({ orderNumber }: { orderNumber: number }) {
  const label = displayOrderNumber(orderNumber);
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 text-left">
      <p className="text-xs font-semibold text-zinc-600">
        Número do pedido <span className="font-normal text-zinc-400">(guarde para o suporte)</span>
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
        {label}
      </p>
      <div className="mt-2">
        <CopyButton
          value={copyOrderNumber(orderNumber)}
          label="Copiar nº do pedido"
          variant="outline"
          className="text-xs !px-2 !py-1.5"
        />
      </div>
    </div>
  );
}

export function CredentialSuccessPanel({
  copyAllText,
  credential,
  releasing = false,
  orderNumber,
}: CredentialSuccessPanelProps) {
  if (releasing || !copyAllText.trim()) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-xl font-bold" style={{ color: "var(--theme-success)" }}>
          Pagamento aprovado!
        </p>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium text-emerald-900">Liberando suas credenciais de acesso…</p>
          <p className="text-xs text-emerald-800/80">Isso costuma levar poucos segundos. Não feche esta janela.</p>
        </div>
        {orderNumber != null ? (
          <div className="mx-auto w-full max-w-md text-left">
            <OrderNumberBlock orderNumber={orderNumber} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div>
        <p className="text-xl font-bold" style={{ color: "var(--theme-success)" }}>
          Pagamento aprovado!
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Use os dados abaixo para acessar o <strong>aplicativo</strong> do seu plano.
        </p>
      </div>

      <div
        className="rounded-2xl border-2 p-5 text-left shadow-sm"
        style={{
          backgroundColor: "var(--theme-success-bg, #ecfdf5)",
          borderColor: "color-mix(in srgb, var(--theme-success, #059669) 30%, transparent)",
        }}
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-900/80">
          {credential?.kindLabel ?? "Credencial de acesso"}
        </p>

        {!credential ? (
          <div className="whitespace-pre-wrap rounded-lg border border-zinc-200/80 bg-white px-3 py-3 font-mono text-sm text-zinc-900">
            {copyAllText}
          </div>
        ) : credential.type === "username_password" ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Usuário</p>
              <div className="mt-1 rounded-lg border border-zinc-200/80 bg-white px-3 py-2 font-mono text-sm text-zinc-900">
                {credential.username || "—"}
              </div>
              {credential.username ? (
                <CopyFeedbackButton
                  text={credential.username}
                  label="Copiar usuário"
                  copiedLabel="Usuário copiado!"
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-lg py-2 text-xs"
                />
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">Senha</p>
              <div className="mt-1 rounded-lg border border-zinc-200/80 bg-white px-3 py-2 font-mono text-sm text-zinc-900">
                {credential.password || "—"}
              </div>
              {credential.password ? (
                <CopyFeedbackButton
                  text={credential.password}
                  label="Copiar senha"
                  copiedLabel="Senha copiada!"
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-lg py-2 text-xs"
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-zinc-500">Código</p>
            <div className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200/80 bg-white px-3 py-3 font-mono text-base font-semibold text-zinc-900">
              {credential.activationCode || copyAllText}
            </div>
          </div>
        )}
      </div>

      <CopyFeedbackButton
        text={copyAllText}
        label="Copiar todas as credenciais"
        copiedLabel="Tudo copiado com sucesso!"
        variant="theme"
        className="rounded-2xl py-4 text-base font-bold"
      />
      <p className="text-xs text-zinc-500">
        Salvamos também na sua área do cliente.
      </p>
      {orderNumber != null ? (
        <OrderNumberBlock orderNumber={orderNumber} />
      ) : null}
      <Link
        href="/account/access"
        className="theme-link block text-center text-sm font-semibold hover:underline"
      >
        Abrir Meus acessos →
      </Link>
    </div>
  );
}
