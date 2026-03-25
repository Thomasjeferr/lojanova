"use client";

import { ShoppingCart, LogIn, QrCode, Gift } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: ShoppingCart,
    title: "Escolha o plano",
    description: "Selecione o período de acesso que melhor combina com você.",
  },
  {
    step: 2,
    icon: LogIn,
    title: "Faça login ou crie conta",
    description: "Entre com sua conta ou cadastre-se em poucos segundos.",
  },
  {
    step: 3,
    icon: QrCode,
    title: "Pague via Pix",
    description: "Gere o QR Code ou copie o código e pague no app do seu banco.",
  },
  {
    step: 4,
    icon: Gift,
    title: "Receba automaticamente",
    description: "O código de ativação é liberado assim que o pagamento é confirmado.",
  },
];

function StepConnector() {
  return (
    <>
      {/* Desktop: linha de fluxo atrás dos cards */}
      <div
        className="pointer-events-none absolute left-14 right-14 top-[8.75rem] z-0 hidden h-px lg:block"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--theme-primary) 28%, var(--landing-border-strong)) 14%, color-mix(in srgb, var(--theme-primary) 36%, var(--landing-border-strong)) 52%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Mobile/tablet: linha vertical lateral */}
      <div
        className="pointer-events-none absolute bottom-8 left-6 top-40 z-0 w-px lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--theme-primary) 25%, var(--landing-border-strong)) 10%, color-mix(in srgb, var(--theme-primary) 32%, var(--landing-border-strong)) 78%, transparent 100%)",
        }}
        aria-hidden
      />
    </>
  );
}

function StepCard({
  item,
  index,
}: {
  item: (typeof steps)[number];
  index: number;
}) {
  const Icon = item.icon;
  return (
    <article
      className="group relative z-10 h-full landing-reveal"
      style={{ animationDelay: `${0.07 * index}s` }}
    >
      <div className="landing-card-surface relative flex h-full flex-col overflow-hidden rounded-3xl px-5 pt-6 pb-5 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_52px_-22px_var(--theme-featured-shadow)] sm:px-6 sm:pt-7 sm:pb-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 62%, white) 0%, color-mix(in srgb, var(--theme-primary) 88%, transparent) 52%, transparent 100%)",
          }}
        />

        <div className="relative mb-4 flex items-center gap-2.5">
          <span className="theme-step-number inline-flex h-11 min-w-11 items-center justify-center rounded-2xl px-3 text-sm font-black shadow-md">
            {item.step}
          </span>
          <div className="theme-icon-tile relative inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <h3
          className="text-lg font-extrabold tracking-tight sm:text-xl"
          style={{ color: "var(--landing-text-primary)" }}
        >
          {item.title}
        </h3>
        <p
          className="mt-3 text-sm leading-relaxed sm:text-[0.96rem]"
          style={{ color: "var(--landing-text-muted)" }}
        >
          {item.description}
        </p>
      </div>
    </article>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24">
      {/* Fundo premium com glow suave */}
      <div
        className="pointer-events-none absolute left-1/2 top-12 h-72 w-[min(90%,780px)] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-glow-a) 85%, transparent) 0%, color-mix(in srgb, var(--theme-glow-b) 55%, transparent) 42%, transparent 74%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--theme-soft) 55%, transparent) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg text-balance">
            Como funciona a <span className="font-extrabold text-[var(--theme-primary)]">compra</span>{" "}
            de acesso e a ativação via Pix
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-relaxed sm:text-base"
            style={{ color: "var(--landing-text-muted)" }}
          >
            Em poucos passos você sai do checkout com o <strong>código de ativação</strong> na conta:
            escolha do plano, login, Pix e <strong>ativação automática</strong> após confirmação.
          </p>
        </div>

        <div className="relative mt-12">
          <StepConnector />
          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((item, i) => (
              <StepCard key={item.step} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
