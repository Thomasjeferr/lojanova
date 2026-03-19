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
    <section id="planos" className="relative px-4 py-24 sm:py-28 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/25 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">
            {copy.plansTitle}
          </h2>
          <p className="landing-lead mx-auto mt-6 max-w-2xl">
            {copy.plansSubtitle}
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6 lg:mt-20 lg:gap-8">
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
