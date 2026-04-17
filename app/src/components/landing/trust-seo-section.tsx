"use client";

import Link from "next/link";
import type { LandingCopy } from "@/lib/site-branding";
import { LandingRichText } from "@/components/landing/landing-rich-text";

/**
 * Bloco de texto rico para SEO on-page (Brasil, Pix, código de ativação) + conversão.
 */
export function TrustSeoSection({ copy }: { copy: LandingCopy }) {
  return (
    <section
      aria-labelledby="seo-trust-heading"
      className="relative border-t border-[var(--landing-border)] px-4 py-14 sm:py-16 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/20 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="seo-trust-heading"
          className="landing-heading-lg text-balance"
          style={{ color: "var(--landing-text-primary)" }}
        >
          {copy.trustSeoTitle}
        </h2>
        <div
          className="mt-8 space-y-5 text-left text-[15px] leading-relaxed sm:text-base"
          style={{ color: "var(--landing-text-secondary)" }}
        >
          <p>
            <LandingRichText text={copy.trustSeoParagraph1} />
          </p>
          <p>
            <LandingRichText text={copy.trustSeoParagraph2} />
          </p>
          <p className="text-center sm:text-left">
            <Link
              href={copy.trustSeoLink1Href}
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              {copy.trustSeoLink1Label}
            </Link>
            {" · "}
            <Link
              href={copy.trustSeoLink2Href}
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              {copy.trustSeoLink2Label}
            </Link>
            {" · "}
            <Link
              href={copy.trustSeoLink3Href}
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              {copy.trustSeoLink3Label}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
