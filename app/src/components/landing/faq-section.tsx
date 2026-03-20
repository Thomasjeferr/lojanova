"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingCopy } from "@/lib/site-branding";
import { LANDING_FAQ_ITEMS } from "@/lib/seo/faq-data";

export function FAQSection({ copy }: { copy: LandingCopy }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-section-alt border-t px-4 py-24 sm:py-28 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">{copy.faqTitle}</h2>
          <p className="landing-lead mt-6">{copy.faqSubtitle}</p>
        </div>
        <div className="mt-14 space-y-4">
          {LANDING_FAQ_ITEMS.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className={cn(
                  "landing-card-surface landing-faq-card overflow-hidden rounded-2xl transition-all duration-300",
                  open && "theme-faq-open",
                  !open && "hover:-translate-y-0.5",
                )}
              >
                <h3 className="m-0 text-[1rem] font-semibold leading-snug sm:text-[1.0625rem]">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7 sm:py-6"
                    style={{ color: "var(--landing-text-primary)" }}
                    aria-expanded={open}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-300",
                        open ? "rotate-180 text-[var(--theme-primary)]" : "",
                      )}
                      style={!open ? { color: "var(--landing-text-muted)" } : undefined}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p
                      className="border-t px-6 py-5 text-sm leading-relaxed sm:px-7 sm:text-[0.9375rem]"
                      style={{
                        borderColor: "var(--landing-faq-divider)",
                        color: "var(--landing-text-muted)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
