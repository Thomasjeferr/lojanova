"use client";

import Image from "next/image";
import { BadgeCheck, CheckCircle2, Download, Sparkles } from "lucide-react";
import type { LandingCopy } from "@/lib/site-branding";

type DownloadApp = {
  name: string;
  url: string;
  imageUrl: string;
};

function parseStepsBlob(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function AppVisual({
  imageUrl,
  alt,
  placeholderHint,
}: {
  imageUrl: string;
  alt: string;
  placeholderHint: string;
}) {
  if (imageUrl) {
    return (
      <div className="landing-inset-glass relative mb-5 aspect-video w-full overflow-hidden rounded-2xl border border-[var(--landing-border)] p-1.5 shadow-[0_14px_32px_-20px_rgba(0,0,0,0.4)]">
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={675}
          className="h-auto w-full rounded-xl object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          unoptimized={imageUrl.startsWith("http") || imageUrl.startsWith("data:")}
        />
      </div>
    );
  }

  return (
    <div className="landing-inset-glass mb-5 rounded-2xl border border-[var(--landing-border)] p-3 text-sm text-[var(--landing-text-muted)]">
      {placeholderHint}
    </div>
  );
}

function StepsList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5 space-y-3.5">
      {steps.map((step, index) => (
        <li
          key={`${index}-${step.slice(0, 24)}`}
          className="flex items-start gap-3 text-sm leading-relaxed text-[var(--landing-text-secondary)] sm:text-[0.96rem]"
        >
          <span className="theme-check-dot mt-[2px] inline-flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-bold">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function MethodCard({
  badge,
  title,
  subtitle,
  steps,
  imageUrl,
  imageAlt,
  placeholderHint,
  featuredLabel,
  featured = false,
}: {
  badge: string;
  title: string;
  subtitle: string;
  steps: string[];
  imageUrl: string;
  imageAlt: string;
  placeholderHint: string;
  featuredLabel: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`landing-card-surface landing-reveal group relative overflow-hidden rounded-3xl p-5 sm:p-6 ${
        featured
          ? "border-[color-mix(in_srgb,var(--theme-primary)_35%,var(--landing-border))] shadow-[0_26px_70px_-34px_var(--theme-featured-shadow),0_0_60px_-28px_color-mix(in_srgb,var(--theme-primary)_42%,transparent)]"
          : "shadow-[0_24px_64px_-36px_rgba(0,0,0,0.35)]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--theme-primary-soft) 28%, white 72%) 0%, transparent 100%)",
        }}
      />
      {featured ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md sm:text-[11px]">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          {featuredLabel}
        </span>
      ) : null}

      <AppVisual imageUrl={imageUrl} alt={imageAlt} placeholderHint={placeholderHint} />

      <p className="landing-inset-glass inline-flex rounded-full border border-[var(--landing-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--theme-primary-strong)]">
        {badge}
      </p>
      <h3 className="mt-4 text-2xl font-black tracking-tight text-[var(--landing-text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--landing-text-muted)]">{subtitle}</p>
      <StepsList steps={steps} />
    </article>
  );
}

function DownloadCTA({
  app,
  buttonLabel,
  cardDescription,
  index,
}: {
  app: DownloadApp;
  buttonLabel: string;
  cardDescription: string;
  index: number;
}) {
  return (
    <article
      className="landing-card-surface landing-reveal group relative overflow-hidden rounded-3xl p-5 shadow-[0_30px_76px_-42px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1.5 sm:p-6"
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 85% 10%, color-mix(in srgb, var(--theme-primary-soft) 58%, white) 0%, transparent 55%), linear-gradient(180deg, color-mix(in srgb, var(--theme-primary-soft) 14%, white) 0%, transparent 72%)",
        }}
      />
      <div className="relative z-10">
        <h3 className="text-2xl font-black tracking-tight text-[var(--landing-text-primary)]">{app.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--landing-text-secondary)]">{cardDescription}</p>
        {app.imageUrl ? (
          <div className="landing-inset-glass relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-[var(--landing-border)] p-1.5 shadow-[0_14px_32px_-20px_rgba(0,0,0,0.35)]">
            <Image
              src={app.imageUrl}
              alt={`Imagem do app ${app.name}`}
              width={960}
              height={540}
              className="h-auto w-full rounded-xl object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
              loading="lazy"
              unoptimized={app.imageUrl.startsWith("http") || app.imageUrl.startsWith("data:")}
            />
          </div>
        ) : null}
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="theme-btn-primary-lg mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-base font-semibold shadow-[0_18px_38px_-16px_var(--theme-featured-shadow)] transition-all duration-300 hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" aria-hidden />
          {buttonLabel || "Baixar aplicativo"}
        </a>
      </div>
    </article>
  );
}

function DownloadSection({ copy }: { copy: LandingCopy }) {
  const apps: DownloadApp[] = [
    {
      name: copy.downloadApp1Name.trim(),
      url: copy.downloadApp1Url.trim(),
      imageUrl: copy.downloadApp1ImageUrl.trim(),
    },
    {
      name: copy.downloadApp2Name.trim(),
      url: copy.downloadApp2Url.trim(),
      imageUrl: copy.downloadApp2ImageUrl.trim(),
    },
    {
      name: copy.downloadApp3Name.trim(),
      url: copy.downloadApp3Url.trim(),
      imageUrl: copy.downloadApp3ImageUrl.trim(),
    },
  ].filter((item) => item.name && item.url);

  if (!apps.length) return null;

  const steps1 = parseStepsBlob(copy.downloadMethod1Steps);
  const steps2 = parseStepsBlob(copy.downloadMethod2Steps);

  return (
    <section className="landing-section-alt relative overflow-hidden border-t px-4 py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, color-mix(in srgb, var(--theme-glow-a) 45%, transparent) 0%, transparent 52%), linear-gradient(180deg, color-mix(in srgb, var(--theme-soft) 35%, transparent) 0%, transparent 48%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-28 h-56 w-[min(92%,860px)] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-glow-b) 58%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <p className="landing-inset-glass mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--landing-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--theme-primary-strong)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {copy.downloadInstallationBadge}
          </p>
          <h2 className="landing-heading-lg mt-4">
            {copy.downloadHeroTitlePrefix}
            <span className="theme-text-gradient">{copy.downloadHeroTitleHighlight}</span>
            {copy.downloadHeroTitleSuffix}
          </h2>
          <p className="landing-lead mx-auto mt-4 max-w-3xl">{copy.downloadAppsSubtitle}</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
          <MethodCard
            badge={copy.downloadMethod1Badge}
            title={copy.downloadMethod1Title}
            subtitle={copy.downloadMethod1Subtitle}
            imageUrl={copy.downloadApp1ImageUrl.trim()}
            imageAlt={`Imagem do app ${copy.downloadApp1Name || "app"}`}
            placeholderHint={copy.downloadPlaceholderHint}
            featuredLabel={copy.downloadFeaturedLabel}
            featured
            steps={steps1}
          />
          <MethodCard
            badge={copy.downloadMethod2Badge}
            title={copy.downloadMethod2Title}
            subtitle={copy.downloadMethod2Subtitle}
            imageUrl={copy.downloadApp2ImageUrl.trim()}
            imageAlt={`Imagem do app ${copy.downloadApp2Name || "app"}`}
            placeholderHint={copy.downloadPlaceholderHint}
            featuredLabel={copy.downloadFeaturedLabel}
            steps={steps2}
          />
        </div>

        <div className="landing-inset-glass mt-5 flex items-center gap-2 rounded-xl border border-[var(--landing-border)] px-3 py-2.5 text-xs text-[var(--landing-text-muted)] sm:text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--theme-primary)]" aria-hidden />
          {copy.downloadSecurityTip}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {apps.map((app, index) => (
            <DownloadCTA
              key={`${app.name}-${index}`}
              app={app}
              cardDescription={copy.downloadAppCardDescription}
              buttonLabel={copy.downloadAppsButtonLabel || "Baixar aplicativo"}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppDownloadSection({ copy }: { copy: LandingCopy }) {
  return <DownloadSection copy={copy} />;
}
