"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { currencyBRL } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

type Plan = {
  id: string;
  title: string;
  logoDataUrl?: string | null;
  durationDays: number;
  priceCents: number;
  isFeatured?: boolean;
};

function Stepper({
  step,
  onNavigate,
}: {
  step: number;
  onNavigate: (targetStep: 1 | 2 | 3) => void;
}) {
  const items = ["Resumo", "Pagamento", "Confirmação"];
  return (
    <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-1.5">
      {items.map((label, i) => {
        const idx = i + 1;
        const targetStep = (idx as 1 | 2 | 3);
        const active =
          (step === 1 && idx === 1) || (step >= 2 && step <= 3 && idx === 2) || (step === 4 && idx === 3);
        const canNavigate =
          (step >= 2 && targetStep === 1) ||
          (step === 4 && targetStep === 2) ||
          (step === 4 && targetStep === 3);
        return (
          <button
            key={label}
            type="button"
            onClick={() => canNavigate && onNavigate(targetStep)}
            disabled={!canNavigate}
            className={
              active
                ? "rounded-lg bg-white px-2 py-2 text-center text-xs font-semibold text-zinc-900 shadow-sm"
                : canNavigate
                  ? "px-2 py-2 text-center text-xs font-medium text-zinc-500 transition hover:text-zinc-800"
                  : "px-2 py-2 text-center text-xs font-medium text-zinc-400"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PlanSummaryCard({
  plan,
  priceCaption,
}: {
  plan: Plan;
  priceCaption?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--theme-primary)]/90 via-[var(--theme-gradient-via)]/80 to-transparent" />
      {plan.isFeatured && (
        <span className="mb-3 inline-flex rounded-full bg-[var(--theme-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--theme-primary)]">
          Melhor escolha
        </span>
      )}
      {plan.logoDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={plan.logoDataUrl}
          alt={`Logo do ${plan.title}`}
          className="mb-3 h-9 w-auto max-w-[180px] object-contain object-left"
        />
      )}
      <p className="text-2xl font-bold tracking-tight text-zinc-900">{plan.title}</p>
      <p className="mt-1 text-sm text-zinc-500">Validade: {plan.durationDays} dias</p>
      <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: "var(--theme-price-accent)" }}>
        {currencyBRL(plan.priceCents)}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-zinc-400">
        {priceCaption || "Pagamento único"}
      </p>
    </div>
  );
}

function PaymentButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--theme-gradient-from)] via-[var(--theme-gradient-via)] to-[var(--theme-gradient-to)] px-6 py-4 text-base font-bold text-white shadow-[0_18px_34px_-14px_var(--theme-featured-shadow)] transition-all duration-300 hover:scale-[1.02] hover:brightness-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Zap className="h-4 w-4" />
      {loading ? "Processando..." : children}
      {!loading && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

function SecurityInfo() {
  return (
    <div className="space-y-1 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-600">
      <p className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Pagamento seguro via Pix
      </p>
      <p className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-600" />
        Liberação automática após pagamento
      </p>
    </div>
  );
}

export function CheckoutModal({
  plan,
  open,
  onClose,
  loggedInUser = null,
}: {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
  loggedInUser?: { email: string } | null;
}) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open || !plan) {
      setStep(1);
    }
  }, [open, plan]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");

  const title = useMemo(() => {
    if (step === 1) return "Resumo do plano";
    if (step === 2) return "Identificação";
    if (step === 3) return "Pagamento via Pix";
    return "Pagamento aprovado";
  }, [step]);

  if (!open || !plan) return null;

  function normalizePhone(raw: string) {
    return raw.replace(/\D/g, "");
  }

  function formatPhoneMask(raw: string) {
    let digits = normalizePhone(raw);
    if (digits.startsWith("55")) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function isValidBrazilPhone(raw: string) {
    const digits = normalizePhone(raw);
    // Aceita 10/11 dígitos (DDD + número) ou 12/13 com DDI 55
    if (digits.startsWith("55")) {
      const local = digits.slice(2);
      return local.length === 10 || local.length === 11;
    }
    return digits.length === 10 || digits.length === 11;
  }

  async function authAndContinue() {
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim().toLowerCase();
    const confirmEmailTrimmed = confirmEmail.trim().toLowerCase();
    const phoneTrimmed = phone.trim();

    if (!nameTrimmed) {
      setError("Informe seu nome completo.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (emailTrimmed !== confirmEmailTrimmed) {
      setError("Os e-mails não conferem.");
      return;
    }

    if (!isValidBrazilPhone(phoneTrimmed)) {
      setError("Informe um celular válido com DDD.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password }),
      });
      if (!login.ok) {
        const register = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameTrimmed,
            email: emailTrimmed,
            phone: phoneTrimmed,
            password,
          }),
        });
        if (!register.ok) {
          const data = await register.json();
          throw new Error(data.error || "Não foi possível entrar");
        }
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  }

  async function createPix() {
    if (!plan) return;
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      setOrderId(orderData.orderId);

      const pixRes = await fetch("/api/checkout/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const pixData = await pixRes.json();
      if (!pixRes.ok) throw new Error(pixData.error);
      setQrCode(pixData.qrCodeImage);
      setPixCode(pixData.brCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Pix");
    } finally {
      setLoading(false);
    }
  }

  async function checkPayment() {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/status?orderId=${orderId}`);
      const data = await res.json();
      if (data.status === "paid") {
        setDeliveryCode(data.code || "");
        setStep(4);
      } else {
        setError("Pagamento ainda não confirmado. Tente novamente em alguns segundos.");
      }
    } finally {
      setLoading(false);
    }
  }

  function navigateStepper(targetStep: 1 | 2 | 3) {
    if (targetStep === 1 && step >= 2) {
      setStep(1);
      return;
    }
    if (targetStep === 2 && step === 4) {
      setStep(3);
      return;
    }
    if (targetStep === 3 && step === 4) {
      setStep(4);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl rounded-2xl border-zinc-200/80 bg-white/95 p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
              {step === 1 ? "Resumo do seu plano" : title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {step === 1 ? "Confira os detalhes antes de continuar" : "Fluxo de checkout seguro"}
            </p>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Stepper step={step} onNavigate={navigateStepper} />

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-zinc-600">Você está comprando:</p>
            <PlanSummaryCard plan={plan} />
            {loggedInUser ? (
              <PaymentButton
                onClick={async () => {
                  await createPix();
                  setStep(3);
                }}
                disabled={loading}
                loading={loading}
              >
                Pagar com Pix
              </PaymentButton>
            ) : (
              <Button variant="theme" className="w-full rounded-2xl py-4 text-base font-bold" onClick={() => setStep(2)}>
                Continuar compra
              </Button>
            )}
            <SecurityInfo />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-600">
              Identifique-se corretamente para que possamos enviar seu acesso corretamente!
            </p>
            <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              placeholder="Confirmar e-mail"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <Input
              placeholder="Celular com DDD (ex.: 11999998888)"
              value={phone}
              onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
              type="tel"
              inputMode="numeric"
              maxLength={16}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Se você já tiver conta, faremos login automaticamente com e-mail e senha. A confirmação
              ajuda a evitar erros no checkout.
            </p>
            <PaymentButton onClick={authAndContinue} disabled={loading} loading={loading}>
              Entrar e continuar
            </PaymentButton>
            <SecurityInfo />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {!qrCode ? (
              <PaymentButton onClick={createPix} disabled={loading} loading={loading}>
                Gerar Pix
              </PaymentButton>
            ) : (
              <>
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                  <p className="mb-3 text-sm font-medium text-zinc-600">
                    Escaneie o QR Code ou copie o código Pix:
                  </p>
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code Pix" className="h-56 w-56 rounded-xl border border-zinc-200 bg-white p-2" />
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs break-all">{pixCode}</div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-3"
                  onClick={() => navigator.clipboard.writeText(pixCode)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código Pix
                </Button>
                <PaymentButton onClick={checkPayment} disabled={loading} loading={loading}>
                  Já paguei, verificar agora
                </PaymentButton>
                <SecurityInfo />
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p
              className="text-xl font-bold"
              style={{ color: "var(--theme-success)" }}
            >
              Pagamento aprovado!
            </p>
            <p className="text-zinc-600">Seu código de ativação foi liberado:</p>
            <div
              className="rounded-xl border p-4 font-mono text-lg"
              style={{
                backgroundColor: "var(--theme-success-bg)",
                borderColor: "color-mix(in srgb, var(--theme-success) 25%, transparent)",
              }}
            >
              {deliveryCode}
            </div>
            <Button variant="theme" className="w-full rounded-2xl py-4 text-base font-bold" onClick={() => navigator.clipboard.writeText(deliveryCode)}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar código
            </Button>
            <p className="text-xs text-zinc-500">
              Guarde este código. Ele também está disponível na sua área do cliente.
            </p>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </Card>
    </div>
  );
}
