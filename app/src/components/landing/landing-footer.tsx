"use client";

import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";

export function LandingFooter({ branding }: { branding: SiteBrandingPublic }) {
  const { storeDisplayName, landingCopy } = branding;
  return (
    <footer
      className="border-t px-4 py-16 sm:py-20"
      style={{
        background: "var(--landing-footer-bg)",
        borderColor: "var(--landing-footer-border)",
        color: "var(--landing-footer-text)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandingLogo
              branding={branding}
              href="/"
              textClassName="text-xl font-bold tracking-tight text-[var(--landing-footer-heading)] sm:text-2xl"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-90">
              {landingCopy.footerTagline}
            </p>
          </div>
          <nav className="flex flex-wrap gap-8 text-sm font-medium">
            <a
              href="/termos"
              className="transition-colors hover:text-[var(--theme-ring)]"
              style={{ color: "var(--landing-footer-text)" }}
            >
              Termos de uso
            </a>
            <a
              href="/privacidade"
              className="transition-colors hover:text-[var(--theme-ring)]"
              style={{ color: "var(--landing-footer-text)" }}
            >
              Privacidade
            </a>
            <a
              href="/suporte"
              className="transition-colors hover:text-[var(--theme-ring)]"
              style={{ color: "var(--landing-footer-text)" }}
            >
              Suporte
            </a>
          </nav>
        </div>
        <div
          className="mt-14 border-t pt-10 text-sm"
          style={{ borderColor: "var(--landing-footer-border)", color: "var(--landing-text-subtle)" }}
        >
          © {new Date().getFullYear()} {storeDisplayName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
