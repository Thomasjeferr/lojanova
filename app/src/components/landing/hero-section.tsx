"use client";

import type { LandingCopy } from "@/lib/site-branding";
import { HeroAmbientParticles } from "@/components/landing/hero-ambient-particles";

export function HeroSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative z-10 overflow-hidden px-4 pt-24 pb-20 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 lg:pt-44 lg:pb-36">
      {/* Camadas locais: foco no título + legibilidade (fundo global já traz malha/aurora). */}
      <div className="landing-hero-rings absolute inset-0 -z-[2]" aria-hidden>
        <div className="landing-hero-ring landing-hero-ring--outer" />
        <div className="landing-hero-ring" />
      </div>
      <HeroAmbientParticles />
      <div
        className="landing-title-glow pointer-events-none absolute left-1/2 top-[20%] -z-[2] h-48 w-[min(100%,760px)] -translate-x-1/2 rounded-full opacity-100 md:top-[24%] md:h-56"
        aria-hidden
      />
      <div className="theme-hero-fade absolute inset-0 -z-[3] opacity-90" aria-hidden />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p
          className="landing-hero-pill landing-reveal mx-auto mb-6 inline-flex max-w-full flex-wrap items-center justify-center rounded-full px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.72rem] sm:tracking-[0.24em]"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {copy.heroEyebrow}
        </p>

        <h1 className="landing-reveal landing-reveal-delay-1 landing-heading-xl">
          {copy.heroTitlePrefix}{" "}
          <span className="theme-text-gradient">{copy.heroTitleHighlight}</span>, {copy.heroTitleSuffix}
        </h1>

        <p className="landing-reveal landing-reveal-delay-2 landing-lead mx-auto mt-6 max-w-2xl md:leading-relaxed">
          {copy.heroSubtitle}
        </p>

        <div className="landing-reveal landing-reveal-delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4">
          <a
            href="#planos"
            className="theme-btn-primary-lg inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold sm:w-auto"
          >
            {copy.heroPrimaryCta}
          </a>
          <a
            href="#planos"
            className="landing-btn-secondary inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold sm:w-auto"
          >
            {copy.heroSecondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
