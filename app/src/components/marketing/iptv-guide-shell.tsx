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
        <nav className="mb-8 text-sm text-zinc-500">
          <Link href="/" className="font-medium text-orange-600 hover:underline">
            Início
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-zinc-700">{content.h1}</span>
        </nav>

        <header className="border-b border-zinc-200 pb-10">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl md:text-[2.35rem] md:leading-[1.15]">
            {content.h1}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600">
            <IptvInlineText text={content.lead} />
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/planos"
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              Ver planos e comprar com Pix
            </Link>
            <Link
              href="/comprar-acesso"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Comprar acesso
            </Link>
          </div>
        </header>

        <div className="prose-iptv mt-12 space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading} aria-labelledby={slugify(section.heading)}>
              <h2
                id={slugify(section.heading)}
                className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl"
              >
                {section.heading}
              </h2>
              <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-zinc-600 sm:text-base">
                {section.paragraphs.map((p, j) => (
                  <p key={`${section.heading}-${j}`}>
                    <IptvInlineText text={p} />
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm">
                  {section.bulletTitle ? (
                    <p className="text-sm font-semibold text-zinc-900">{section.bulletTitle}</p>
                  ) : null}
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-600 sm:text-[0.98rem]">
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

        <section className="mt-16 border-t border-zinc-200 pt-14" aria-labelledby="faq-iptv">
          <h2 id="faq-iptv" className="text-xl font-bold text-zinc-900 sm:text-2xl">
            Perguntas frequentes
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            Respostas objetivas para intenções de busca reais — sem enrolação.
          </p>
          <div className="mt-8 space-y-3">
            {content.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm open:shadow-md"
              >
                <summary className="cursor-pointer list-none px-4 py-4 font-semibold text-zinc-900 marker:hidden [&::-webkit-details-marker]:hidden sm:px-5">
                  <span className="flex items-center justify-between gap-3">
                    {faq.question}
                    <span className="text-zinc-400 transition group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <p className="border-t border-zinc-100 px-4 py-4 text-sm leading-relaxed text-zinc-600 sm:px-5 sm:text-[0.98rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-white px-6 py-10 sm:px-10">
          <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Continue no funil</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Linkagem interna para você comparar conteúdo e fechar com Pix quando estiver pronto.
          </p>
          <ul className="mt-6 space-y-4">
            {content.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group font-semibold text-orange-700 hover:text-orange-900"
                >
                  <span className="underline-offset-2 group-hover:underline">{link.label}</span>
                  <span className="mt-1 block text-sm font-normal text-zinc-600 group-hover:text-zinc-700">
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
