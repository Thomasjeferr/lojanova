"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import type { LandingUserSession } from "@/lib/landing-user-session";

export function LandingHeader({
  userSession = null,
  branding,
  /** Em páginas sem âncora #planos (ex.: guias IPTV), use `/planos#planos`. */
  primaryCtaHref = "#planos",
  primaryCtaLabel = "Ver planos",
}: {
  userSession?: LandingUserSession | null;
  branding: SiteBrandingPublic;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        "translate-z-0 [backface-visibility:hidden]",
        scrolled
          ? "border-[var(--landing-header-border)] bg-[var(--landing-header-bg-scrolled)] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-5">
        <BrandingLogo
          branding={branding}
          href="/"
          textClassName="text-xl font-bold tracking-tight text-[var(--landing-logo-text)] sm:text-2xl"
          imgClassName="h-8 max-h-10 sm:h-10"
        />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/planos"
            className="hidden rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)] sm:inline-flex"
          >
            Planos
          </Link>
          <Link
            href="/comprar-acesso"
            className="hidden rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)] md:inline-flex"
          >
            Comprar acesso
          </Link>
          <Link
            href="/comprar-iptv"
            className="hidden rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)] lg:inline-flex"
          >
            IPTV
          </Link>
          {userSession ? (
            <Link
              href="/account"
              className="rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)]"
            >
              Minha conta
            </Link>
          ) : (
            <Link
              href="/entrar"
              className="rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)]"
            >
              Entrar
            </Link>
          )}
          <a
            href={primaryCtaHref}
            className="theme-header-cta rounded-xl px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
          >
            {primaryCtaLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
