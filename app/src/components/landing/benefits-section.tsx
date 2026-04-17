"use client";

import { Zap, Shield, CreditCard, Mail } from "lucide-react";
import type { LandingCopy } from "@/lib/site-branding";
import { LandingRichText } from "@/components/landing/landing-rich-text";

const icons = [Zap, Shield, CreditCard, Mail] as const;

export function BenefitsSection({ copy }: { copy: LandingCopy }) {
  const items = [
    { icon: icons[0], title: copy.benefit1Title, description: copy.benefit1Description },
    { icon: icons[1], title: copy.benefit2Title, description: copy.benefit2Description },
    { icon: icons[2], title: copy.benefit3Title, description: copy.benefit3Description },
    { icon: icons[3], title: copy.benefit4Title, description: copy.benefit4Description },
  ];

  return (
    <section className="landing-section-alt border-t px-4 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg text-balance">{copy.benefitsTitle}</h2>
          <p className="landing-lead mx-auto mt-5 max-w-2xl text-balance">
            <LandingRichText text={copy.benefitsSubtitle} />
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="landing-card-surface landing-reveal rounded-2xl p-6 sm:p-7"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="theme-icon-tile flex h-14 w-14 items-center justify-center rounded-2xl">
                <item.icon className="h-7 w-7" aria-hidden />
              </div>
              <h3
                className="mt-5 text-lg font-bold tracking-tight"
                style={{ color: "var(--landing-text-primary)" }}
              >
                {item.title}
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed sm:text-[0.9375rem]"
                style={{ color: "var(--landing-text-muted)" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
