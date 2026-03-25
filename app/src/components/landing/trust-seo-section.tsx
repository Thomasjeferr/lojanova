"use client";

import Link from "next/link";

/**
 * Bloco de texto rico para SEO on-page (Brasil, Pix, código de ativação) + conversão.
 */
export function TrustSeoSection() {
  return (
    <section
      aria-labelledby="seo-trust-heading"
      className="relative border-t border-[var(--landing-border)] px-4 py-14 sm:py-16 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/20 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="seo-trust-heading"
          className="landing-heading-lg text-balance"
          style={{ color: "var(--landing-text-primary)" }}
        >
          Entrega imediata via Pix e ativação automática no Brasil
        </h2>
        <div
          className="mt-8 space-y-5 text-left text-[15px] leading-relaxed sm:text-base"
          style={{ color: "var(--landing-text-secondary)" }}
        >
          <p>
            Aqui você faz a <strong>compra de acesso</strong> com pagamento nacional: o{" "}
            <strong>Pix</strong> confirma em instantes e você{" "}
            <strong>recebe acesso na hora</strong> — sem esperar atendimento manual. O fluxo foi
            pensado para <strong>ativação rápida</strong>: escolha o plano, pague e use seu{" "}
            <strong>código de ativação</strong> assim que o banco validar o Pix.
          </p>
          <p>
            Se você busca <strong>ativação imediata</strong> e transparência, este é o caminho:{" "}
            <strong>pagamento seguro</strong> no ecossistema financeiro brasileiro,{" "}
            <strong>entrega automática</strong> do código na sua conta e histórico de pedidos sempre
            disponível. Ideal para quem quer ativar streaming com método simples e suporte quando
            precisar.
          </p>
          <p className="text-center sm:text-left">
            <Link
              href="/comprar-iptv"
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              Guia para comprar IPTV com Pix
            </Link>
            {" · "}
            <Link
              href="/como-funciona-iptv"
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              Como funciona
            </Link>
            {" · "}
            <Link
              href="/iptv-e-confiavel"
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              IPTV é confiável?
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
