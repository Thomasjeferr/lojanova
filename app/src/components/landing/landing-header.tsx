"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";

export function LandingHeader({
  userSession = null,
  branding,
}: {
  userSession?: { email: string } | null;
  branding: SiteBrandingPublic;
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
        "fixed left-0 right-0 top-0 z-50 border-b transition-all duration-500 ease-out",
        scrolled
          ? "border-[var(--landing-header-border)] bg-[var(--landing-header-bg-scrolled)] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6">
        <BrandingLogo
          branding={branding}
          href="/"
          textClassName="text-xl font-bold tracking-tight text-[var(--landing-logo-text)] sm:text-2xl"
          imgClassName="h-8 max-h-10 sm:h-10"
        />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {userSession ? (
            <Link
              href="/account"
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)]"
            >
              Minha conta
            </Link>
          ) : (
            <Link
              href="/entrar"
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 text-[var(--landing-header-link)] hover:bg-[var(--landing-header-link-hover-bg)] hover:text-[var(--landing-header-link-hover-text)]"
            >
              Entrar
            </Link>
          )}
          <a
            href="#planos"
            className="theme-header-cta rounded-xl px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15"
          >
            Ver planos
          </a>
        </nav>
      </div>
    </header>
  );
}
