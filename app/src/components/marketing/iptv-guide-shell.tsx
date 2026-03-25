import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingGlobalBackdrop } from "@/components/landing/landing-global-backdrop";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import type { LandingUserSession } from "@/lib/landing-user-session";
import { IptvInlineText } from "@/components/marketing/iptv-inline-text";
import type { IptvPageContent } from "@/lib/seo/iptv-pages-content";

export function IptvGuideShell({
  children,
  branding,
  userSession,
}: {
  children: React.ReactNode;
  branding: SiteBrandingPublic;
  userSession?: LandingUserSession | null;
}) {
  return (
    <div
      className="landing-shell relative min-h-screen overflow-x-hidden"
      style={
        {
          "--landing-text-primary": branding.landingCopy.textPrimaryColor,
          "--landing-text-secondary": branding.landingCopy.textSecondaryColor,
          "--landing-text-muted": branding.landingCopy.textMutedColor,
        } as React.CSSProperties
      }
    >
      <LandingGlobalBackdrop />
      <LandingHeader
        branding={branding}
        userSession={userSession}
        primaryCtaHref="/planos#planos"
      />
      <div className="relative z-10">{children}</div>
      <div className="relative z-10">
        <LandingFooter branding={branding} />
      </div>
    </div>
  );
}

export function IptvArticle({ content }: { content: IptvPageContent }) {
  return (
    <article className="px-4 pb-24 pt-28 sm:pt-32 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 text-sm" style={{ color: "var(--landing-text-muted)" }}>
          <Link
            href="/"
            className="font-medium text-[var(--theme-primary)] underline-offset-2 hover:underline"
          >
            Início
          </Link>
          <span className="mx-2 opacity-70" aria-hidden>
            /
          </span>
          <span style={{ color: "var(--landing-text-secondary)" }}>{content.h1}</span>
        </nav>

        <header className="border-b pb-10" style={{ borderColor: "var(--landing-border)" }}>
          <h1
            className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-[2.35rem] md:leading-[1.15]"
            style={{ color: "var(--landing-text-primary)" }}
          >
            {content.h1}
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--landing-text-muted)" }}>
            <IptvInlineText text={content.lead} />
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/planos"
              className="theme-btn-primary-lg inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-center text-sm font-semibold shadow-sm sm:min-w-[200px]"
            >
              Ver planos e comprar com Pix
            </Link>
            <Link href="/comprar-acesso" className="landing-btn-secondary inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-center text-sm font-semibold sm:min-w-[200px]">
              Comprar acesso
            </Link>
          </div>
        </header>

        <div className="prose-iptv mt-12 space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading} aria-labelledby={slugify(section.heading)}>
              <h2
                id={slugify(section.heading)}
                className="text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: "var(--landing-text-primary)" }}
              >
                {section.heading}
              </h2>
              <div
                className="mt-5 space-y-4 text-[0.98rem] leading-relaxed sm:text-base"
                style={{ color: "var(--landing-text-muted)" }}
              >
                {section.paragraphs.map((p, j) => (
                  <p key={`${section.heading}-${j}`}>
                    <IptvInlineText text={p} />
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <div className="landing-card-surface mt-6 rounded-2xl p-6">
                  {section.bulletTitle ? (
                    <p className="text-sm font-semibold" style={{ color: "var(--landing-text-primary)" }}>
                      {section.bulletTitle}
                    </p>
                  ) : null}
                  <ul
                    className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed sm:text-[0.98rem]"
                    style={{ color: "var(--landing-text-muted)" }}
                  >
                    {section.bullets.map((item) => (
                      <li key={item}>
                        <IptvInlineText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-16 border-t pt-14" style={{ borderColor: "var(--landing-border)" }} aria-labelledby="faq-iptv">
          <h2
            id="faq-iptv"
            className="text-xl font-bold sm:text-2xl"
            style={{ color: "var(--landing-text-primary)" }}
          >
            Perguntas frequentes
          </h2>
          <p className="mt-3 text-sm" style={{ color: "var(--landing-text-muted)" }}>
            Respostas objetivas para intenções de busca reais — sem enrolação.
          </p>
          <div className="mt-8 space-y-3">
            {content.faqs.map((faq) => (
              <details key={faq.question} className="group landing-card-surface rounded-2xl p-1 open:shadow-lg">
                <summary
                  className="cursor-pointer list-none px-4 py-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden sm:px-5"
                  style={{ color: "var(--landing-text-primary)" }}
                >
                  <span className="flex items-center justify-between gap-3">
                    {faq.question}
                    <span
                      className="transition group-open:rotate-180"
                      style={{ color: "var(--landing-text-subtle)" }}
                      aria-hidden
                    >
                      ▼
                    </span>
                  </span>
                </summary>
                <p
                  className="border-t px-4 py-4 text-sm leading-relaxed sm:px-5 sm:text-[0.98rem]"
                  style={{
                    borderColor: "var(--landing-border)",
                    color: "var(--landing-text-muted)",
                  }}
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-card-surface mt-16 rounded-3xl px-6 py-10 sm:px-10">
          <h2 className="text-lg font-bold sm:text-xl" style={{ color: "var(--landing-text-primary)" }}>
            Continue no funil
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--landing-text-muted)" }}>
            Linkagem interna para você comparar conteúdo e fechar com Pix quando estiver pronto.
          </p>
          <ul className="mt-6 space-y-4">
            {content.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group font-semibold text-[var(--theme-primary)] hover:text-[var(--theme-primary-hover)]"
                >
                  <span className="underline-offset-2 group-hover:underline">{link.label}</span>
                  <span
                    className="mt-1 block text-sm font-normal group-hover:opacity-90"
                    style={{ color: "var(--landing-text-muted)" }}
                  >
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}

function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base ? `iptv-${base}` : "iptv-section";
}
