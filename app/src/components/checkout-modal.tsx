"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { currencyBRL } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import type { Plan } from "@/components/landing/plan-card";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";
import { displayOrderNumber } from "@/lib/order-ref";
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

function pickAlternativePlans(
  selected: Plan,
  allPlans: Plan[],
  stock: Record<string, number>,
  limit = 3,
): Plan[] {
  return allPlans
    .filter((p) => p.id !== selected.id && (stock[p.id] ?? 0) > 0)
    .sort((a, b) => {
      const da = Math.abs(a.durationDays - selected.durationDays);
      const db = Math.abs(b.durationDays - selected.durationDays);
      if (da !== db) return da - db;
      return Math.abs(a.priceCents - selected.priceCents) - Math.abs(b.priceCents - selected.priceCents);
    })
    .slice(0, limit);
}

function Stepper({
  step,
  onNavigate,
}: {
  step: number;
  onNavigate: (targetStep: 1 | 2 | 3) => void;
}) {
  const items = ["Resumo", "Pagamento", "Confirmação"];
  return (
    <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-1.5 transition-colors duration-300">
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
                ? "rounded-lg bg-white px-2 py-2 text-center text-xs font-semibold text-zinc-900 shadow-sm transition-all duration-300 ease-out"
                : canNavigate
                  ? "rounded-lg px-2 py-2 text-center text-xs font-medium text-zinc-500 transition-all duration-300 ease-out hover:bg-white/60 hover:text-zinc-800"
                  : "rounded-lg px-2 py-2 text-center text-xs font-medium text-zinc-400 transition-colors duration-200"
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
  outOfStock = false,
}: {
  plan: Plan;
  priceCaption?: string;
  outOfStock?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.35)] transition-[opacity,box-shadow,transform] duration-500 ease-out motion-reduce:transition-none ${outOfStock ? "opacity-75 ring-2 ring-amber-200/80" : ""}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--theme-primary)]/90 via-[var(--theme-gradient-via)]/80 to-transparent" />
      {outOfStock && (
        <span className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-900">
          Esgotado no momento
        </span>
      )}
      {!outOfStock && plan.isFeatured && (
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
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--theme-gradient-from)] via-[var(--theme-gradient-via)] to-[var(--theme-gradient-to)] px-6 py-4 text-base font-bold text-white shadow-[0_18px_34px_-14px_var(--theme-featured-shadow)] transition-[transform,filter,box-shadow] duration-300 ease-out hover:scale-[1.02] hover:brightness-[1.03] hover:shadow-[0_22px_40px_-12px_var(--theme-featured-shadow)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-70"
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

/** Opção 5 — obrigatório antes de gerar/pagar Pix (logado ou convidado no passo do Pix). */
function PrePayDeliveryNotice({
  onConfirm,
  whatsappLink,
}: {
  onConfirm: () => void;
  whatsappLink?: string | null;
}) {
  const [readChecked, setReadChecked] = useState(false);
  const wa = typeof whatsappLink === "string" ? whatsappLink.trim() : "";
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/95 to-white p-4 shadow-sm sm:p-5">
      <p className="text-base font-bold tracking-tight text-zinc-900">Antes de pagar, saiba:</p>
      <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-zinc-700">
        <li>
          Com o Pix confirmado, o acesso aparece <strong className="text-zinc-900">aqui no site</strong>.
        </li>
        <li>
          Enviamos também para o <strong className="text-zinc-900">e-mail do cadastro</strong> e por{" "}
          <strong className="text-zinc-900">SMS</strong>.
        </li>
        <li>
          Não encontrou? Fale no{" "}
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--theme-primary)] underline underline-offset-2 hover:brightness-110"
            >
              WhatsApp
            </a>
          ) : (
            <Link
              href="/contato"
              className="font-semibold text-[var(--theme-primary)] underline underline-offset-2 hover:brightness-110"
            >
              WhatsApp
            </Link>
          )}
          .
        </li>
      </ul>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-300/90 bg-white p-3.5 text-sm leading-snug text-zinc-800 shadow-sm transition-colors hover:border-zinc-400/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--theme-primary)]/35">
        <input
          type="checkbox"
          checked={readChecked}
          onChange={(e) => setReadChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-400 text-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/40"
          aria-describedby="prepay-checkbox-hint"
        />
        <span className="font-medium">
          Li e entendi onde vou receber o acesso (site, e-mail e SMS) e que posso falar no WhatsApp se
          precisar.
        </span>
      </label>
      <p id="prepay-checkbox-hint" className="text-xs text-zinc-500">
        O botão abaixo só libera depois que você marcar a caixa — assim evitamos seguir sem ler.
      </p>

      <Button
        type="button"
        variant="theme"
        disabled={!readChecked}
        className="w-full rounded-2xl py-3.5 text-base font-bold transition-[transform,filter] duration-200 hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
        onClick={onConfirm}
      >
        Confirmo que entendi
      </Button>
    </div>
  );
}

export function CheckoutModal({
  plan,
  allPlans,
  onPlanChange,
  open,
  onClose,
  loggedInUser = null,
  whatsappLink = null,
}: {
  plan: Plan | null;
  allPlans: Plan[];
  onPlanChange: (plan: Plan) => void;
  open: boolean;
  onClose: () => void;
  loggedInUser?: { email: string; payerCpf?: string | null } | null;
  /** Link público do WhatsApp (contato); se vazio, o aviso aponta para /contato. */
  whatsappLink?: string | null;
}) {
  const [step, setStep] = useState(1);
  const [prePayNoticeAcknowledged, setPrePayNoticeAcknowledged] = useState(false);
  const [stockByPlanId, setStockByPlanId] = useState<Record<string, number> | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockFetchError, setStockFetchError] = useState<string | null>(null);
  const [stockRetryTick, setStockRetryTick] = useState(0);
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
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");
  const [credentialDetail, setCredentialDetail] = useState<CheckoutCredentialDetail | null>(null);
  const [payerDocument, setPayerDocument] = useState("");
  /** null = carregando hints; GGPIX exige CPF na API, Woovi não. */
  const [checkoutHints, setCheckoutHints] = useState<{ requiresPayerCpf: boolean } | null>(null);
  const [cpfWiggle, setCpfWiggle] = useState(false);
  const pollCountRef = useRef(0);
  const cpfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !plan) {
      setStep(1);
      setPrePayNoticeAcknowledged(false);
      setPayerDocument("");
      setOrderId("");
      setOrderNumber(null);
      setQrCode("");
      setPixCode("");
      setDeliveryCode("");
      setCredentialDetail(null);
      setError("");
      setCheckoutHints(null);
      setCpfWiggle(false);
      pollCountRef.current = 0;
      return;
    }

    setStep(1);
    setPrePayNoticeAcknowledged(false);
    setOrderId("");
    setOrderNumber(null);
    setQrCode("");
    setPixCode("");
    setDeliveryCode("");
    setCredentialDetail(null);
    setError("");
    setCheckoutHints(null);
    setCpfWiggle(false);
    pollCountRef.current = 0;

    const saved = loggedInUser?.payerCpf
      ? normalizePayerDocument(loggedInUser.payerCpf)
      : "";
    setPayerDocument(isValidPayerDocument(saved) ? saved : "");
  }, [open, plan, loggedInUser?.email, loggedInUser?.payerCpf]);

  useEffect(() => {
    if (!open) {
      setCheckoutHints(null);
      return;
    }
    let cancelled = false;
    fetch("/api/public/checkout-hints")
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { requiresPayerCpf?: boolean };
        if (!cancelled) {
          setCheckoutHints({ requiresPayerCpf: data.requiresPayerCpf !== false });
        }
      })
      .catch(() => {
        if (!cancelled) setCheckoutHints({ requiresPayerCpf: true });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  /** Confirmação automática após o Pix e, se preciso, espera a credencial do webhook. */
  useEffect(() => {
    if (!open || !orderId) {
      pollCountRef.current = 0;
      return;
    }

    const waitingPixConfirm = step === 3 && Boolean(qrCode);
    const waitingCredential = step === 4 && !deliveryCode.trim();
    if (!waitingPixConfirm && !waitingCredential) {
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
          setStep(4);
          setError("");
          const line = typeof data.code === "string" ? data.code : "";
          const cred = mapStatusCredential(data.credential);
          if (line) {
            setDeliveryCode(line);
            setCredentialDetail(cred);
          }
        }
      } catch {
        /* ignora falhas de rede pontuais no poll */
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
  }, [open, step, orderId, qrCode, deliveryCode]);

  useEffect(() => {
    if (!open) {
      setStockByPlanId(null);
      setStockFetchError(null);
      setStockRetryTick(0);
      return;
    }
    let cancelled = false;
    setStockLoading(true);
    setStockFetchError(null);
    setStockByPlanId(null);
    fetch("/api/public/plans-stock")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Falha ao consultar estoque");
        if (!data.stock || typeof data.stock !== "object") throw new Error("Resposta inválida");
        if (!cancelled) setStockByPlanId(data.stock as Record<string, number>);
      })
      .catch((e) => {
        if (!cancelled) {
          setStockFetchError(e instanceof Error ? e.message : "Erro de rede");
          setStockByPlanId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, stockRetryTick]);

  const title = useMemo(() => {
    if (step === 1) return "Resumo do plano";
    if (step === 2) return "Identificação";
    if (step === 3) return "Pagamento via Pix";
    return "Pagamento aprovado";
  }, [step]);

  const alternatives = useMemo(() => {
    if (!plan || !stockByPlanId) return [];
    return pickAlternativePlans(plan, allPlans, stockByPlanId);
  }, [plan, allPlans, stockByPlanId]);

  const stockReady = Boolean(stockByPlanId && !stockFetchError);
  const unitsForPlan = plan && stockByPlanId ? (stockByPlanId[plan.id] ?? 0) : 0;
  const outOfStock = Boolean(stockReady && plan && unitsForPlan === 0);
  const anyAlternative = alternatives.length > 0;
  const globalSoldOut = Boolean(stockReady && plan && outOfStock && !anyAlternative);
  const canProceedStep1 = Boolean(
    plan && stockByPlanId && !stockLoading && !stockFetchError && (stockByPlanId[plan.id] ?? 0) > 0,
  );
  const payerDocOk = isValidPayerDocument(normalizePayerDocument(payerDocument));
  /** Até carregar hints, assume CPF obrigatório (compatível com GGPIX). */
  const requiresPayerCpf = checkoutHints === null ? true : checkoutHints.requiresPayerCpf;
  const payerDocDigitsLen = normalizePayerDocument(payerDocument).length;

  function triggerCpfAttention() {
    setError("Informe o CPF do titular com 11 dígitos para gerar o Pix.");
    setCpfWiggle(true);
    window.setTimeout(() => setCpfWiggle(false), 480);
    cpfInputRef.current?.focus();
    requestAnimationFrame(() => {
      cpfInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });
  }

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

    if (requiresPayerCpf) {
      const docDigits = normalizePayerDocument(payerDocument);
      if (!isValidPayerDocument(docDigits)) {
        setError("Informe um CPF válido do titular do pagamento.");
        triggerCpfAttention();
        return;
      }
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
        credentials: "same-origin",
        body: JSON.stringify({ email: emailTrimmed, password }),
      });
      if (!login.ok) {
        const registerBody: Record<string, string> = {
          name: nameTrimmed,
          email: emailTrimmed,
          phone: phoneTrimmed,
          password,
        };
        if (requiresPayerCpf) {
          registerBody.payerCpf = normalizePayerDocument(payerDocument);
        }
        const register = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(registerBody),
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

  async function createPix(): Promise<boolean> {
    if (!plan) return false;
    const docDigits = normalizePayerDocument(payerDocument);
    if (requiresPayerCpf && !isValidPayerDocument(docDigits)) {
      setError("Informe um CPF válido do titular do pagamento.");
      triggerCpfAttention();
      return false;
    }
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planId: plan.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      setOrderId(orderData.orderId);
      if (typeof orderData.orderNumber === "number") {
        setOrderNumber(orderData.orderNumber);
      }

      const pixBody: { orderId: string; payerDocument?: string } = {
        orderId: orderData.orderId,
      };
      if (requiresPayerCpf) {
        pixBody.payerDocument = docDigits;
      }

      const pixRes = await fetch("/api/checkout/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(pixBody),
      });
      const pixData = await pixRes.json();
      if (!pixRes.ok) throw new Error(pixData.error);
      setQrCode(pixData.qrCodeImage);
      setPixCode(pixData.brCode);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Pix");
      return false;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="checkout-modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-md supports-[backdrop-filter]:bg-black/40"
        aria-hidden
      />
      <Card className="checkout-modal-panel relative z-10 w-full max-w-2xl rounded-2xl border-zinc-200/70 bg-white/95 p-7 shadow-[0_25px_80px_-24px_rgba(0,0,0,0.3)] sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
              {step === 1 ? "Resumo do seu plano" : title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {step === 1 ? "Confira os detalhes antes de continuar" : "Fluxo de checkout seguro"}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-all duration-200 ease-out hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Stepper step={step} onNavigate={navigateStepper} />

        <div key={step} className="checkout-modal-step">
        {step === 1 && (
          <div className="space-y-5">
            {stockLoading && (
              <div className="flex flex-col items-center gap-3 py-8 text-sm text-zinc-600">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                Verificando disponibilidade…
              </div>
            )}

            {!stockLoading && stockFetchError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p>{stockFetchError}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 rounded-xl"
                  onClick={() => setStockRetryTick((t) => t + 1)}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {!stockLoading && stockReady && (
              <>
                {outOfStock && (
                  <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                    <div>
                      <p className="font-semibold">Estoque esgotado para este plano</p>
                      <p className="mt-1 text-amber-900/90">
                        {globalSoldOut
                          ? "No momento não há códigos disponíveis em nenhum plano. Tente mais tarde ou fale conosco pelo WhatsApp."
                          : "Outras opções ainda têm código disponível para liberação imediata:"}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-sm font-medium text-zinc-600">Você está comprando:</p>
                <PlanSummaryCard plan={plan} outOfStock={outOfStock} />

                {outOfStock && anyAlternative && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-zinc-700">Planos disponíveis agora</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {alternatives.map((alt) => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => onPlanChange(alt)}
                          className="rounded-2xl border border-zinc-200/90 bg-white p-4 text-left shadow-sm ring-0 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--theme-primary)] hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.18)] hover:ring-2 hover:ring-[var(--theme-ring)]/20 active:translate-y-0 motion-reduce:hover:translate-y-0"
                        >
                          <p className="font-semibold text-zinc-900">{alt.title}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{alt.durationDays} dias</p>
                          <p
                            className="mt-2 text-lg font-bold"
                            style={{ color: "var(--theme-price-accent)" }}
                          >
                            {currencyBRL(alt.priceCents)}
                          </p>
                          <span className="mt-2 inline-block text-xs font-semibold text-[var(--theme-primary)]">
                            Escolher este plano →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loggedInUser ? (
                  !prePayNoticeAcknowledged ? (
                    <PrePayDeliveryNotice
                      whatsappLink={whatsappLink}
                      onConfirm={() => setPrePayNoticeAcknowledged(true)}
                    />
                  ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 px-3 py-2.5 text-sm text-zinc-700">
                      <p>
                        Conta:{" "}
                        <span className="font-semibold text-zinc-900">{loggedInUser.email}</span>
                      </p>
                      {requiresPayerCpf ? (
                        <p className="mt-1 text-xs text-zinc-600">
                          Antes do Pix, informe o <strong>CPF de quem vai pagar</strong> (obrigatório
                          para gerar o QR Code).
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-600">
                          Toque em <strong>Pagar com Pix</strong> para gerar o QR Code.
                        </p>
                      )}
                    </div>

                    {requiresPayerCpf ? (
                      <div
                        className={`space-y-2 rounded-xl border-2 bg-white p-3 transition-[border-color,box-shadow] duration-200 sm:p-4 ${
                          cpfWiggle ? "checkout-cpf-wiggle" : ""
                        } ${
                          payerDocOk
                            ? "border-emerald-200/90 shadow-sm shadow-emerald-500/5"
                            : "border-amber-200/90 shadow-sm shadow-amber-500/10"
                        }`}
                      >
                        <Label
                          htmlFor="checkout-payer-cpf"
                          className="flex flex-wrap items-center gap-1.5 text-zinc-900"
                        >
                          CPF do pagador
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                            Obrigatório
                          </span>
                        </Label>
                        <Input
                          ref={cpfInputRef}
                          id="checkout-payer-cpf"
                          placeholder="Somente números (11 dígitos)"
                          value={payerDocument}
                          onChange={(e) => {
                            setPayerDocument(e.target.value.replace(/[^\d]/g, "").slice(0, 11));
                            setError("");
                          }}
                          inputMode="numeric"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                          aria-invalid={requiresPayerCpf && !payerDocOk}
                          aria-describedby="checkout-payer-cpf-hint"
                          className="rounded-xl border-zinc-300 text-base text-zinc-900 placeholder:text-zinc-400"
                        />
                        <p id="checkout-payer-cpf-hint" className="text-xs leading-relaxed text-zinc-600">
                          {payerDocDigitsLen > 0 && payerDocDigitsLen < 11 ? (
                            <span className="font-medium text-amber-800">
                              Faltam {11 - payerDocDigitsLen} dígito(s). Complete o CPF para habilitar o
                              pagamento.
                            </span>
                          ) : payerDocOk &&
                            loggedInUser?.payerCpf &&
                            normalizePayerDocument(loggedInUser.payerCpf) ===
                              normalizePayerDocument(payerDocument) ? (
                            <>
                              <span className="font-medium text-emerald-800">
                                CPF salvo da sua conta (último pagamento).
                              </span>{" "}
                              <span className="text-zinc-600">
                                Edite o campo se <strong>outra pessoa</strong> for pagar o Pix.
                              </span>
                            </>
                          ) : (
                            <>
                              Use o CPF de quem paga no app do banco.{" "}
                              <span className="text-zinc-500">
                                Dados exigidos pelo provedor de Pix.
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    ) : null}

                    <PaymentButton
                      type="button"
                      onClick={async () => {
                        if (requiresPayerCpf && !payerDocOk) {
                          triggerCpfAttention();
                          return;
                        }
                        const okPix = await createPix();
                        if (okPix) setStep(3);
                      }}
                      disabled={loading || !canProceedStep1}
                      loading={loading}
                    >
                      Pagar com Pix
                    </PaymentButton>
                    {requiresPayerCpf && !payerDocOk && canProceedStep1 ? (
                      <p className="text-center text-xs font-medium text-amber-800">
                        Preencha o CPF acima para continuar.
                      </p>
                    ) : null}
                  </div>
                  )
                ) : (
                  <Button
                    variant="theme"
                    className="w-full rounded-2xl py-4 text-base font-bold transition-[transform,filter,box-shadow] duration-300 ease-out hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:active:scale-100"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continuar compra
                  </Button>
                )}
                <SecurityInfo />
              </>
            )}
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
            {requiresPayerCpf ? (
              <div className="space-y-1.5">
                <Label htmlFor="checkout-payer-cpf-step2" className="text-zinc-900">
                  CPF do pagador{" "}
                  <span className="text-amber-700">(obrigatório para o Pix)</span>
                </Label>
                <Input
                  ref={cpfInputRef}
                  id="checkout-payer-cpf-step2"
                  placeholder="Somente números (11 dígitos)"
                  value={payerDocument}
                  onChange={(e) => setPayerDocument(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
                  inputMode="numeric"
                  autoComplete="off"
                  className={`rounded-xl ${cpfWiggle ? "checkout-cpf-wiggle" : ""}`}
                  aria-invalid={!payerDocOk && payerDocDigitsLen > 0}
                />
                {payerDocDigitsLen > 0 && payerDocDigitsLen < 11 ? (
                  <p className="text-xs font-medium text-amber-800">
                    Faltam {11 - payerDocDigitsLen} dígito(s).
                  </p>
                ) : null}
              </div>
            ) : null}
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
              !prePayNoticeAcknowledged ? (
                <PrePayDeliveryNotice
                  whatsappLink={whatsappLink}
                  onConfirm={() => setPrePayNoticeAcknowledged(true)}
                />
              ) : (
              <PaymentButton onClick={createPix} disabled={loading} loading={loading}>
                Gerar Pix
              </PaymentButton>
              )
            ) : (
              <>
                {orderNumber != null ? (
                  <p className="text-center text-sm text-zinc-700">
                    Seu pedido:{" "}
                    <span className="font-bold tabular-nums text-zinc-900">
                      {displayOrderNumber(orderNumber)}
                    </span>
                    <span className="text-zinc-500"> — anote se precisar falar com o suporte.</span>
                  </p>
                ) : null}
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                  <p className="mb-3 text-sm font-medium text-zinc-600">
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
                    <strong className="text-zinc-700">Pix copia e cola</strong> → cole o código. Você também pode
                    selecionar o texto acima.
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
                    Assim que o Pix for compensado, esta tela avança sozinha. Você não precisa fazer mais nada.
                  </p>
                </div>
                <SecurityInfo />
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <CredentialSuccessPanel
            copyAllText={deliveryCode}
            credential={credentialDetail}
            releasing={!deliveryCode.trim()}
            orderNumber={orderNumber ?? undefined}
          />
        )}
        </div>

        {error && (
          <p className="checkout-modal-error mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}
