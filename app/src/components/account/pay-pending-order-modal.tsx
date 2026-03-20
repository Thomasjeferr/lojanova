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
import { CopyFeedbackButton } from "@/components/copy-feedback-button";

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
    const intervalMs = 3500;
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
                  Escaneie o QR Code ou copie o código Pix:
                </p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="QR Code Pix"
                    className="h-52 w-52 rounded-xl border border-zinc-200 bg-white p-2 sm:h-56 sm:w-56"
                  />
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs break-all text-zinc-800">
                  {pixCode}
                </div>
                <CopyFeedbackButton
                  text={pixCode}
                  label="Copiar código Pix"
                  copiedLabel="Código Pix copiado!"
                  variant="outline"
                  className="rounded-xl py-3"
                />
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
