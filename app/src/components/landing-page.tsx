"use client";

import { useState, type CSSProperties } from "react";
import { CheckoutModal } from "@/components/checkout-modal";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { PlansSection } from "@/components/landing/plans-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AppDownloadSection } from "@/components/landing/app-download-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { TrustSeoSection } from "@/components/landing/trust-seo-section";
import { LandingInnerHero } from "@/components/landing/landing-inner-hero";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import type { Plan } from "@/components/landing/plan-card";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import type { ContactSettingsPublic } from "@/lib/contact-settings";

export type LandingMode = "home" | "planos" | "comprar";

export function LandingPage({
  plans,
  dbConnected = true,
  userSession = null,
  branding,
  contactSettings,
  landingMode = "home",
}: {
  plans: Plan[];
  dbConnected?: boolean;
  userSession?: { email: string } | null;
  branding: SiteBrandingPublic;
  contactSettings: ContactSettingsPublic;
  landingMode?: LandingMode;
}) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <main
      className="landing-shell relative min-h-screen overflow-x-hidden"
      style={
        {
          "--landing-text-primary": branding.landingCopy.textPrimaryColor,
          "--landing-text-secondary": branding.landingCopy.textSecondaryColor,
          "--landing-text-muted": branding.landingCopy.textMutedColor,
        } as CSSProperties
      }
    >
      <LandingHeader userSession={userSession} branding={branding} />
      {!dbConnected && (
        <div className="relative z-40 border-b border-amber-400/40 bg-amber-500/15 px-4 py-2.5 text-center text-sm text-amber-950 backdrop-blur-sm">
          Banco de dados não conectado. Configure <strong>DATABASE_URL</strong> e{" "}
          <strong>DIRECT_URL</strong> no arquivo{" "}
          <code className="rounded bg-amber-500/20 px-1">app/.env</code> com a connection string do
          Neon e rode{" "}
          <code className="rounded bg-amber-500/20 px-1">npm run prisma:push</code> e{" "}
          <code className="rounded bg-amber-500/20 px-1">npm run prisma:seed</code>.
        </div>
      )}
      {landingMode === "home" ? (
        <HeroSection copy={branding.landingCopy} />
      ) : (
        <LandingInnerHero mode={landingMode === "planos" ? "planos" : "comprar"} branding={branding} />
      )}
      <PlansSection plans={plans} onSelectPlan={setSelectedPlan} copy={branding.landingCopy} />
      <BenefitsSection />
      <TrustSeoSection />
      <HowItWorksSection />
      <AppDownloadSection copy={branding.landingCopy} />
      <FAQSection copy={branding.landingCopy} />
      <LandingFooter branding={branding} />
      <FloatingWhatsAppButton settings={contactSettings} />
      <CheckoutModal
        plan={selectedPlan}
        open={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        loggedInUser={userSession}
      />
    </main>
  );
}
