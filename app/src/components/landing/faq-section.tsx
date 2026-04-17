"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingCopy } from "@/lib/site-branding";

export function FAQSection({ copy }: { copy: LandingCopy }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqItems = copy.faqItems;

  return (
    <section className="landing-section-alt border-t px-4 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">{copy.faqTitle}</h2>
          <p className="landing-lead mt-5">{copy.faqSubtitle}</p>
        </div>
        <div className="mt-10 space-y-3">
          {faqItems.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={`${index}-${faq.question.slice(0, 48)}`}
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
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6 sm:py-5"
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
                      className="border-t px-5 py-4 text-sm leading-relaxed sm:px-6 sm:text-[0.9375rem]"
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
