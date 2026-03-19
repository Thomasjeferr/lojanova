"use client";

import type { LandingCopy } from "@/lib/site-branding";

export function HeroSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-28 sm:pt-40 sm:pb-32 md:pt-48 md:pb-40 lg:pt-52 lg:pb-44">
      {/* Camadas de profundidade */}
      <div className="landing-grid-bg absolute inset-0 -z-30" aria-hidden />
      <div
        className="landing-mesh-overlay absolute inset-0 -z-[25]"
        aria-hidden
      />
      <div className="landing-blob landing-blob-a -z-20" aria-hidden />
      <div className="landing-blob landing-blob-b -z-20" aria-hidden />
      <div className="landing-blob landing-blob-c -z-20" aria-hidden />
      <div className="theme-hero-radial-a absolute inset-0 -z-20 opacity-80" aria-hidden />
      <div className="theme-hero-radial-b absolute inset-0 -z-20 opacity-70" aria-hidden />
      <div className="theme-hero-ambient absolute inset-0 -z-20 opacity-60" aria-hidden />
      <div className="landing-vignette absolute inset-0 -z-10" aria-hidden />
      <div className="landing-noise absolute inset-0 -z-10 mix-blend-overlay" aria-hidden />
      <div className="theme-hero-fade absolute inset-0 -z-10" aria-hidden />

      {/* Glow atrás do título */}
      <div
        className="landing-title-glow pointer-events-none absolute left-1/2 top-[22%] -z-10 h-44 w-[min(100%,720px)] -translate-x-1/2 rounded-full opacity-100 md:top-[26%] md:h-52"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p
          className="landing-hero-pill landing-reveal mx-auto mb-8 inline-flex max-w-full flex-wrap items-center justify-center rounded-full px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.72rem] sm:tracking-[0.24em]"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {copy.heroEyebrow}
        </p>

        <h1 className="landing-reveal landing-reveal-delay-1 landing-heading-xl">
          {copy.heroTitlePrefix} <span className="theme-text-gradient">{copy.heroTitleHighlight}</span>,{" "}
          {copy.heroTitleSuffix}
        </h1>

        <p className="landing-reveal landing-reveal-delay-2 landing-lead mx-auto mt-7 max-w-2xl md:leading-relaxed">
          {copy.heroSubtitle}
        </p>

        <div className="landing-reveal landing-reveal-delay-3 mt-12 flex flex-col items-center justify-center gap-4 sm:mt-14 sm:flex-row sm:gap-5">
          <a
            href="#planos"
            className="theme-btn-primary-lg inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-10 py-4 text-base font-semibold sm:w-auto"
          >
            {copy.heroPrimaryCta}
          </a>
          <a
            href="#planos"
            className="landing-btn-secondary inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-10 py-4 text-base font-semibold sm:w-auto"
          >
            {copy.heroSecondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
