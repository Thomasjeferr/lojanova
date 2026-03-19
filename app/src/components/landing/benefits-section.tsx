"use client";

import { Zap, Shield, CreditCard, Mail } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Entrega na hora",
    description:
      "Após a confirmação do Pix, seu código de ativação é liberado automaticamente.",
  },
  {
    icon: Shield,
    title: "Pagamento seguro",
    description:
      "Transações via Pix com total segurança. Sem armazenar dados sensíveis.",
  },
  {
    icon: CreditCard,
    title: "Sem mensalidade",
    description:
      "Pague uma vez e use pelo período do plano. Sem cobranças recorrentes.",
  },
  {
    icon: Mail,
    title: "Suporte dedicado",
    description:
      "Dúvidas? Nossa equipe está pronta para ajudar no que precisar.",
  },
];

export function BenefitsSection() {
  return (
    <section className="landing-section-alt border-t px-4 py-24 sm:py-28 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">
            Por que escolher
          </h2>
          <p className="landing-lead mx-auto mt-6 max-w-2xl">
            Processo simples, transparente e pensado para você ativar rápido — com a experiência de
            um produto sério.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {benefits.map((item, i) => (
            <div
              key={item.title}
              className="landing-card-surface landing-reveal rounded-2xl p-8 sm:p-9"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="theme-icon-tile flex h-14 w-14 items-center justify-center rounded-2xl">
                <item.icon className="h-7 w-7" />
              </div>
              <h3
                className="mt-6 text-lg font-bold tracking-tight"
                style={{ color: "var(--landing-text-primary)" }}
              >
                {item.title}
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed sm:text-[0.9375rem]"
                style={{ color: "var(--landing-text-muted)" }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
