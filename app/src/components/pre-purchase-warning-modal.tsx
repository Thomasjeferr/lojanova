"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/components/landing/plan-card";
import type { LandingCopy } from "@/lib/site-branding";
import { currencyBRL } from "@/lib/utils";

type PrePurchaseWarningModalProps = {
  plan: Plan | null;
  /** Nome da loja / marca (ex.: identidade no admin) — aparece como “produto”. */
  storeDisplayName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  copy: LandingCopy;
};

/**
 * Aviso antes do checkout: confirmação de produto e orientação sobre MED / WhatsApp.
 */
export function PrePurchaseWarningModal({
  plan,
  storeDisplayName,
  open,
  onClose,
  onConfirm,
  copy,
}: PrePurchaseWarningModalProps) {
  if (!open || !plan) return null;
  const productLabel = storeDisplayName.trim() || "—";

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center p-3 pb-6 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        aria-label="Fechar aviso"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pre-purchase-warning-title"
        aria-describedby="pre-purchase-warning-desc"
        className="relative z-[1] w-full max-w-lg rounded-2xl border border-amber-400/40 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-5 text-left shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(251,191,36,0.12)] sm:max-w-2xl sm:p-7 md:max-w-3xl"
      >
        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/35 sm:h-12 sm:w-12">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90 sm:text-[11px]">
                Atenção antes do pagamento
              </p>
              <h2
                id="pre-purchase-warning-title"
                className="mt-1 text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl md:text-[1.65rem]"
              >
                {copy.prePurchaseWarningTitle}
              </h2>
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 sm:space-y-2.5 sm:px-4 sm:py-3">
              <p className="text-xs leading-snug text-zinc-300 sm:text-sm">
                <span className="font-medium text-zinc-400">Produto / loja:</span>{" "}
                <span className="font-semibold text-white">{productLabel}</span>
              </p>
              <p className="text-xs leading-snug text-zinc-300 sm:text-sm">
                <span className="font-medium text-zinc-400">Plano:</span>{" "}
                <span className="font-semibold text-white">{plan.title}</span>
                <span className="text-zinc-500"> · </span>
                <span className="font-semibold text-emerald-300/95 tabular-nums">
                  {currencyBRL(plan.priceCents)}
                </span>
              </p>
            </div>
            <div
              id="pre-purchase-warning-desc"
              className="max-h-[min(42vh,320px)] overflow-y-auto text-sm leading-relaxed text-zinc-300 sm:text-base sm:leading-relaxed"
            >
              {copy.prePurchaseWarningBody.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {line || "\u00a0"}
                </p>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3 sm:pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800/80 sm:w-auto"
                onClick={onClose}
              >
                {copy.prePurchaseWarningBackLabel}
              </Button>
              <Button
                type="button"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
                onClick={onConfirm}
              >
                {copy.prePurchaseWarningConfirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
