import type { CSSProperties } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import type { SiteBrandingPublic } from "@/lib/site-branding";

export function LegalPageShell({
  branding,
  userSession,
  title,
  intro,
  children,
}: {
  branding: SiteBrandingPublic;
  userSession?: { email: string } | null;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-zinc-100"
      style={
        {
          "--landing-text-primary": branding.landingCopy.textPrimaryColor,
          "--landing-text-secondary": branding.landingCopy.textSecondaryColor,
          "--landing-text-muted": branding.landingCopy.textMutedColor,
        } as CSSProperties
      }
    >
      <LandingHeader
        branding={branding}
        userSession={userSession}
        primaryCtaHref="/planos#planos"
      />
      <article className="px-4 pb-24 pt-28 sm:pt-32 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-zinc-500">
            <Link href="/" className="font-medium text-orange-600 hover:underline">
              Início
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-zinc-700">{title}</span>
          </nav>

          <header className="border-b border-zinc-200 pb-10">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {title}
            </h1>
            {intro ? (
              <p className="mt-6 text-lg leading-relaxed text-zinc-600">{intro}</p>
            ) : null}
          </header>

          <div className="legal-prose mt-12 space-y-10 text-[0.98rem] leading-relaxed text-zinc-600 sm:text-base">
            {children}
          </div>

          <p className="mt-16 text-sm text-zinc-500">
            Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
        </div>
      </article>
      <LandingFooter branding={branding} />
    </div>
  );
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
        {heading}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
