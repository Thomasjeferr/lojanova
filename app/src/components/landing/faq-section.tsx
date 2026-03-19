"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingCopy } from "@/lib/site-branding";

const faqs = [
  {
    question: "Como recebo o código de ativação?",
    answer:
      "Assim que o pagamento via Pix for confirmado, o código aparece na sua conta e pode ser copiado. Você também pode acessar pelo histórico de pedidos a qualquer momento.",
  },
  {
    question: "O pagamento é seguro?",
    answer:
      "Sim. Utilizamos processamento via Pix e não armazenamos dados sensíveis do seu cartão ou conta. A transação é feita diretamente com o banco.",
  },
  {
    question: "Posso cancelar ou trocar de plano?",
    answer:
      "Cada plano é válido pelo período contratado. Não há cobrança recorrente; após o fim do período, você pode adquirir um novo plano se quiser continuar.",
  },
  {
    question: "E se eu tiver problema com o código?",
    answer:
      "Entre em contato pelo suporte (link no rodapé) com o número do pedido. Nossa equipe verifica e ajuda a resolver o mais rápido possível.",
  },
];

export function FAQSection({ copy }: { copy: LandingCopy }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-section-alt border-t px-4 py-24 sm:py-28 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center landing-reveal">
          <h2 className="landing-heading-lg">{copy.faqTitle}</h2>
          <p className="landing-lead mt-6">
            {copy.faqSubtitle}
          </p>
        </div>
        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "landing-card-surface landing-faq-card overflow-hidden rounded-2xl transition-all duration-300",
                  open && "theme-faq-open",
                  !open && "hover:-translate-y-0.5",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold sm:px-7 sm:py-6 sm:text-lg"
                  style={{ color: "var(--landing-text-primary)" }}
                >
                  {faq.question}
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-300",
                      open ? "rotate-180 text-[var(--theme-primary)]" : "",
                    )}
                    style={!open ? { color: "var(--landing-text-muted)" } : undefined}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p
                      className="border-t px-6 py-5 text-sm leading-relaxed sm:px-7 sm:text-[0.9375rem]"
                      style={{
                        borderColor: "var(--landing-faq-divider)",
                        color: "var(--landing-text-muted)",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
