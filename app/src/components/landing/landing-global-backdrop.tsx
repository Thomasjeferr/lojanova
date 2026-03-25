"use client";

import { LandingNeuralGraphic } from "@/components/landing/landing-neural-graphic";
import { LandingPremiumField } from "@/components/landing/landing-premium-field";

/**
 * Camada fixa de fundo (tema + campo premium + malha + rede neural + aurora + blobs + ruído).
 * O conteúdo da landing fica em wrapper com z-index acima.
 */
export function LandingGlobalBackdrop() {
  return (
    <div className="landing-global-backdrop" aria-hidden>
      <div className="landing-global-base absolute inset-0" />
      <LandingPremiumField />
      <div className="landing-grid-bg landing-global-grid absolute inset-0" />
      <LandingNeuralGraphic />
      <div className="landing-mesh-overlay absolute inset-0" />
      <div className="landing-aurora-layer" />
      <div className="landing-blob landing-blob-a" />
      <div className="landing-blob landing-blob-b" />
      <div className="landing-blob landing-blob-c" />
      <div className="landing-energy-arc landing-energy-arc--a" />
      <div className="landing-energy-arc landing-energy-arc--b" />
      <div className="theme-hero-radial-a absolute inset-0 opacity-[0.5]" />
      <div className="theme-hero-radial-b absolute inset-0 opacity-[0.42]" />
      <div className="theme-hero-radial-c absolute inset-0 opacity-[0.32]" />
      <div className="theme-hero-ambient absolute inset-0 opacity-[0.48]" />
      <div className="landing-vignette absolute inset-0" />
      <div className="landing-noise absolute inset-0 mix-blend-overlay" />
      <div className="landing-global-readability-fade absolute inset-0" />
    </div>
  );
}
