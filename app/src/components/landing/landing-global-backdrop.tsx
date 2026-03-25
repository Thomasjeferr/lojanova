"use client";

import { LandingIaSmokeLayer } from "@/components/landing/landing-ia-smoke-layer";

/**
 * Fundo fixo estilo IA (base escura + feixes + linhas neon orgânicas + vinheta),
 * alinhado ao preview do font-mockup.
 */
export function LandingGlobalBackdrop() {
  return (
    <div className="landing-global-backdrop" aria-hidden>
      <div className="landing-global-base absolute inset-0" />
      <div className="landing-shimmer-beams" />
      <LandingIaSmokeLayer />
      <div className="landing-ia-vignette absolute inset-0" />
      <div className="landing-global-readability-fade absolute inset-0" />
    </div>
  );
}
