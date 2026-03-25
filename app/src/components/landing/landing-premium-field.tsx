"use client";

/**
 * Camada extra de luz / “campo de dados” (gradientes + feixes discretos).
 * Complementa o neural sem substituir — tudo via CSS no tema.
 */
export function LandingPremiumField() {
  return (
    <>
      <div className="landing-premium-field absolute inset-0" aria-hidden />
      <div className="landing-shimmer-beams absolute inset-0" aria-hidden />
    </>
  );
}
