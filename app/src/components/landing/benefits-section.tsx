"use client";

import { Zap, Shield, CreditCard, Mail } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Ativação imediata e entrega automática",
    description:
      "Após a confirmação do Pix no Brasil, seu código de ativação é liberado na hora — ativação rápida, sem filas manuais.",
  },
  {
    icon: Shield,
    title: "Acesso via Pix com segurança nacional",
    description:
      "Pagamento direto com instituições financeiras brasileiras. Não armazenamos dados sensíveis de cartão.",
  },
  {
    icon: CreditCard,
    title: "Compra de acesso sem mensalidade",
    description:
      "Pague uma vez e use pelo período do plano. Sem cobrança recorrente ou surpresa na fatura.",
  },
  {
    icon: Mail,
    title: "Suporte dedicado ao cliente",
    description:
      "Dúvidas sobre código ou pedido? Nossa equipe apoia você com o número da compra em mãos.",
  },
];

export function BenefitsSection() {
  return (
    <section className="landing-section-alt border-t px-4 py-24 sm:py-28 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg text-balance">
            Por que escolher nosso serviço de código de ativação no Brasil
          </h2>
          <p className="landing-lead mx-auto mt-6 max-w-2xl text-balance">
            Processo pensado para quem quer <strong>comprar acesso</strong> com clareza: Pix nacional,{" "}
            <strong>receber acesso na hora</strong> e suporte quando precisar — transparência de
            ponta a ponta.
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
