"use client";

import { cn } from "@/lib/utils";
import { currencyBRL } from "@/lib/utils";
import { Check } from "lucide-react";
import type { LandingCopy } from "@/lib/site-branding";

export type Plan = {
  id: string;
  title: string;
  logoDataUrl: string | null;
  durationDays: number;
  priceCents: number;
  benefits: string[];
  isFeatured: boolean;
};

function PlanCardBody({
  plan,
  onSelect,
  isFeatured,
  copy,
}: {
  plan: Plan;
  onSelect: () => void;
  isFeatured: boolean;
  copy: LandingCopy;
}) {
  return (
    <>
      <div className={cn("relative z-10 mb-8", isFeatured && "mt-2")}>
        {plan.logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plan.logoDataUrl}
            alt={`Logo do ${plan.title}`}
            className="mb-4 h-10 w-auto max-w-[170px] object-contain object-left"
          />
        )}
        <h3
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "var(--landing-text-primary)" }}
        >
          {plan.title}
        </h3>
        <p className="landing-plan-meta mt-3">
          {plan.durationDays} dias de acesso
        </p>
        <div className="mt-6 flex items-baseline gap-1">
          <span
            className={cn(
              "text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl",
              isFeatured ? "text-[var(--theme-price-accent)]" : "",
            )}
            style={!isFeatured ? { color: "var(--landing-text-primary)" } : undefined}
          >
            {currencyBRL(plan.priceCents)}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em]" style={{ color: "var(--landing-text-subtle)" }}>
          {copy.planPriceCaption}
        </p>
        <div className="landing-plan-divider mt-6" />
      </div>
      <ul className="relative z-10 mb-10 flex-1 space-y-4">
        {plan.benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-center gap-3 text-sm leading-relaxed"
            style={{ color: "var(--landing-text-secondary)" }}
          >
            <span className="theme-check-dot flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
              <Check className="h-3 w-3" />
            </span>
            {benefit}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative z-10 w-full rounded-2xl py-4 text-base font-semibold transition-all duration-300 active:scale-[0.98]",
          isFeatured ? "theme-btn-fill text-white" : "landing-plan-secondary-btn",
        )}
      >
        {copy.planBuyButton}
      </button>
    </>
  );
}

export function PlanCard({
  plan,
  onSelect,
  copy,
}: {
  plan: Plan;
  onSelect: () => void;
  copy: LandingCopy;
}) {
  const isFeatured = plan.isFeatured;

  if (isFeatured) {
    return (
      <div className="landing-plan-featured-shell relative hover:-translate-y-1 hover:scale-[1.02]">
        <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2">
          <span className="theme-badge-popular inline-flex rounded-full px-5 py-2 font-bold text-white">
            {copy.planBadgePopular}
          </span>
        </div>
        <div className="landing-plan-featured-inner landing-plan-card landing-plan-card-featured relative flex flex-col p-9 pt-10 sm:p-10 sm:pt-11">
          <div className="relative z-10 flex flex-1 flex-col">
            <PlanCardBody plan={plan} onSelect={onSelect} isFeatured copy={copy} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "landing-card-surface landing-plan-card relative flex flex-col rounded-[1.75rem] p-9 sm:p-10",
        "hover:-translate-y-1 hover:scale-[1.02]",
      )}
    >
      <PlanCardBody plan={plan} onSelect={onSelect} isFeatured={false} copy={copy} />
    </div>
  );
}
