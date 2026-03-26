"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";
import { currencyBRL } from "@/lib/utils";
import { ArrowRight, Loader2, X, Zap } from "lucide-react";
import {
  CredentialSuccessPanel,
  type CheckoutCredentialDetail,
} from "@/components/checkout/credential-success-panel";
import { CopyButton } from "@/components/account/copy-button";

function mapStatusCredential(raw: unknown): CheckoutCredentialDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (type !== "activation_code" && type !== "username_password") return null;
  return {
    type,
    kindLabel: String(o.kindLabel ?? ""),
    activationCode: o.activationCode != null ? String(o.activationCode) : null,
    username: o.username != null ? String(o.username) : null,
    password: o.password != null ? String(o.password) : null,
  };
}

type PayPendingOrderModalProps = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  planTitle: string;
  amountCents: number;
};

export function PayPendingOrderModal({
  open,
  onClose,
  orderId,
  planTitle,
  amountCents,
}: PayPendingOrderModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [paid, setPaid] = useState(false);
  const [deliveryLine, setDeliveryLine] = useState("");
  const [credentialDetail, setCredentialDetail] = useState<CheckoutCredentialDetail | null>(null);
  const [payerDocument, setPayerDocument] = useState("");
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (open) {
      setLoading(false);
      setError("");
      setQrCode("");
      setPixCode("");
      setPaid(false);
      setDeliveryLine("");
      setCredentialDetail(null);
      setPayerDocument("");
    }
  }, [open, orderId]);

  useEffect(() => {
    if (!open || !orderId) {
      pollCountRef.current = 0;
      return;
    }

    const waitingPayment = Boolean(qrCode && !paid);
    const waitingCredential = paid && !deliveryLine.trim();
    if (!waitingPayment && !waitingCredential) {
      pollCountRef.current = 0;
      return;
    }

    let cancelled = false;
    const intervalMs = 2000;
    const maxPolls = 200;

    async function tick() {
      try {
        const res = await fetch(`/api/checkout/status?orderId=${orderId}`, {
          credentials: "same-origin",
        });
        const data = await res.json();
        if (!res.ok || cancelled) return;
        if (data.status === "paid") {
          setPaid(true);
          setError("");
          const line = typeof data.code === "string" ? data.code : "";
          if (line) {
            setDeliveryLine(line);
            setCredentialDetail(mapStatusCredential(data.credential));
          }
          router.refresh();
          return;
        }
        if (data.status === "cancelled") {
          setError("Este pedido foi cancelado. Gere um novo pedido para pagar.");
          setQrCode("");
          setPixCode("");
          return;
        }
        if (data.status === "failed") {
          setError("Este pedido não está mais disponível para pagamento. Gere um novo pedido.");
          setQrCode("");
          setPixCode("");
          return;
        }
      } catch {
        /* poll silencioso */
      }
    }

    void tick();
    pollCountRef.current = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      pollCountRef.current += 1;
      if (pollCountRef.current >= maxPolls) {
        clearInterval(id);
        return;
      }
      void tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, orderId, qrCode, paid, deliveryLine, router]);

  if (!open) return null;

  const payerDocOk = isValidPayerDocument(normalizePayerDocument(payerDocument));

  async function generatePix() {
    const docDigits = normalizePayerDocument(payerDocument);
    if (!isValidPayerDocument(docDigits)) {
      setError("Informe um CPF válido do titular do pagamento.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const pixRes = await fetch("/api/checkout/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId, payerDocument: docDigits }),
      });
      const pixData = await pixRes.json();
      if (!pixRes.ok) throw new Error(pixData.error || "Falha ao gerar Pix");
      setQrCode(pixData.qrCodeImage);
      setPixCode(pixData.brCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Pix");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm supports-[backdrop-filter]:bg-black/40"
        aria-hidden
        onClick={paid ? handleClose : onClose}
      />
      <Card className="relative z-10 w-full max-w-lg rounded-2xl border-zinc-200/80 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Pagar com Pix</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {planTitle} · {currencyBRL(amountCents)}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
            onClick={paid ? handleClose : onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {paid ? (
          <div className="space-y-5">
            <CredentialSuccessPanel
              copyAllText={deliveryLine}
              credential={credentialDetail}
              releasing={!deliveryLine.trim()}
            />
            {!deliveryLine.trim() ? (
              <div
                className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-center text-sm text-amber-900"
                role="status"
                aria-live="polite"
              >
                Pagamento confirmado. Estamos sincronizando seu acesso agora...
              </div>
            ) : null}
            <Button variant="theme" className="w-full rounded-xl py-3" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            {!qrCode ? (
              <div className="space-y-3">
                <Input
                  placeholder="CPF do pagador (somente números)"
                  value={payerDocument}
                  onChange={(e) =>
                    setPayerDocument(e.target.value.replace(/[^\d]/g, "").slice(0, 11))
                  }
                  inputMode="numeric"
                  autoComplete="off"
                  className="rounded-xl"
                />
                <p className="text-xs text-zinc-500">
                  Obrigatório para emitir o Pix pela GGPIXAPI.
                </p>
                <button
                  type="button"
                  disabled={loading || !payerDocOk}
                  onClick={generatePix}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--theme-gradient-from)] via-[var(--theme-gradient-via)] to-[var(--theme-gradient-to)] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Gerar Pix
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-600">
                  Escaneie o QR Code ou use <strong className="text-zinc-800">Pix copia e cola</strong> no app do
                  banco:
                </p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="QR Code Pix"
                    className="h-52 w-52 max-w-full rounded-xl border border-zinc-200 bg-white p-2 sm:h-56 sm:w-56"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Código Pix (copia e cola)
                  </p>
                  <div className="max-h-40 overflow-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:max-h-48">
                    <code className="block select-text break-all font-mono text-[11px] leading-relaxed text-zinc-900 sm:text-xs">
                      {pixCode}
                    </code>
                  </div>
                  <CopyButton
                    value={pixCode}
                    label="Copiar código Pix"
                    copiedLabel="Copiado! Abra o app do banco e cole"
                    className="min-h-[48px] w-full justify-center rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-md hover:bg-emerald-700 active:bg-emerald-800"
                  />
                  <p className="text-center text-xs leading-relaxed text-zinc-500">
                    No app: <strong className="text-zinc-700">Pix</strong> →{" "}
                    <strong className="text-zinc-700">Pix copia e cola</strong> → cole o código.
                  </p>
                </div>
                <div
                  className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-900">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-600" aria-hidden />
                    Aguardando confirmação do pagamento…
                  </p>
                  <p className="text-xs text-emerald-800/85">
                    Quando o Pix for confirmado, esta tela mostrará suas credenciais automaticamente.
                  </p>
                </div>
              </div>
            )}
            {error ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
