"use client";

import { PlanCard } from "./plan-card";
import type { Plan } from "./plan-card";
import type { LandingCopy } from "@/lib/site-branding";

export function PlansSection({
  plans,
  onSelectPlan,
  copy,
}: {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  copy: LandingCopy;
}) {
  return (
    <section id="planos" className="relative px-4 py-16 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/25 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">
            {copy.plansTitle}
          </h2>
          <p className="landing-lead mx-auto mt-5 max-w-2xl">
            {copy.plansSubtitle}
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-5 lg:mt-16 lg:gap-6">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className="landing-reveal"
              style={{ animationDelay: `${0.06 * (i + 1)}s` }}
            >
              <PlanCard plan={plan} onSelect={() => onSelectPlan(plan)} copy={copy} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
