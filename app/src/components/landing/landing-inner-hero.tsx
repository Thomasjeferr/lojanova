"use client";

import type { SiteBrandingPublic } from "@/lib/site-branding";

type Mode = "planos" | "comprar";

export function LandingInnerHero({
  mode,
  branding,
}: {
  mode: Mode;
  branding: SiteBrandingPublic;
}) {
  const isPlanos = mode === "planos";

  return (
    <section className="relative z-10 overflow-hidden px-4 pt-28 pb-14 sm:pt-36 sm:pb-16 md:pt-40 md:pb-20">
      <div
        className="pointer-events-none absolute inset-0 -z-[1] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, var(--theme-primary) 12%, transparent) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p
          className="landing-hero-pill mx-auto mb-6 inline-flex flex-wrap items-center justify-center rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.72rem]"
          style={{ color: "var(--landing-text-muted)" }}
        >
          Pix no Brasil · Código de ativação · Entrega automática
        </p>

        {isPlanos ? (
          <>
            <h1 className="landing-heading-xl text-balance">
              Planos de acesso via Pix —{" "}
              <span className="theme-text-gradient">ativação imediata</span> e código na hora
            </h1>
            <p className="landing-lead mx-auto mt-6 max-w-2xl text-balance md:leading-relaxed">
              Compare períodos, pague com Pix e receba seu código de ativação automaticamente após a
              confirmação. Compra de acesso simples, nacional e com liberação rápida — ideal para
              quem quer evitar burocracia.
            </p>
          </>
        ) : (
          <>
            <h1 className="landing-heading-xl text-balance">
              Comprar acesso com Pix — receba seu{" "}
              <span className="theme-text-gradient">código de ativação</span> na hora
            </h1>
            <p className="landing-lead mx-auto mt-6 max-w-2xl text-balance md:leading-relaxed">
              Fluxo direto: criar conta, pagamento via Pix e ativação automática no Brasil. Você
              acompanha o pedido na área do cliente e copia o código assim que o pagamento confirma.
            </p>
          </>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#planos"
            className="theme-btn-primary-lg inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-10 py-4 text-base font-semibold sm:w-auto"
          >
            {isPlanos ? "Ver tabelas de planos" : "Escolher meu plano"}
          </a>
          <a
            href="/"
            className="landing-btn-secondary inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl px-10 py-4 text-base font-semibold sm:w-auto"
          >
            Voltar à página inicial
          </a>
        </div>

        <p
          className="mx-auto mt-8 max-w-xl text-sm leading-relaxed"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {branding.storeDisplayName}: acesso digital, sem mensalidade surpresa — pague uma vez pelo
          período escolhido.
        </p>
      </div>
    </section>
  );
}
