"use client";

import { useState } from "react";
import { CheckoutModal } from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { currencyBRL } from "@/lib/utils";

type Plan = {
  id: string;
  title: string;
  durationDays: number;
  priceCents: number;
  benefits: string[];
  isFeatured: boolean;
};

export function LandingPage({ plans, dbConnected = true }: { plans: Plan[]; dbConnected?: boolean }) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      {!dbConnected && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
          Banco de dados não conectado. Configure <strong>DATABASE_URL</strong> e <strong>DIRECT_URL</strong> no arquivo <code className="bg-amber-200/60 px-1 rounded">app/.env</code> com a connection string do Neon e rode <code className="bg-amber-200/60 px-1 rounded">npm run prisma:push</code> e <code className="bg-amber-200/60 px-1 rounded">npm run prisma:seed</code>.
        </div>
      )}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-4xl font-black md:text-5xl">Ative seu acesso em minutos, sem complicação</h1>
        <p className="mx-auto mt-4 max-w-3xl text-zinc-600">
          Plataforma SaaS para compra instantânea de códigos de ativação com pagamento via Pix e liberação
          automática.
        </p>
        <a href="#planos">
          <Button className="mt-8">Ver planos</Button>
        </a>
      </section>

      <section id="planos" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Escolha seu plano</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`p-6 ${plan.isFeatured ? "border-blue-600 ring-2 ring-blue-200" : ""}`}>
              <div className="mb-3">
                {plan.isFeatured && <Badge>Mais popular</Badge>}
                <h3 className="mt-2 text-xl font-bold">{plan.title}</h3>
                <p className="text-3xl font-black text-blue-700">{currencyBRL(plan.priceCents)}</p>
                <p className="text-sm text-zinc-500">Validade de {plan.durationDays} dias</p>
              </div>
              <ul className="mb-5 space-y-2 text-sm">
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>- {benefit}</li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => setSelectedPlan(plan)}>
                Comprar Plano
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Benefícios</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-4">Entrega automática do código após confirmação de pagamento.</Card>
          <Card className="p-4">Checkout em modal, sem sair da página e sem fricção.</Card>
          <Card className="p-4">Recompra simplificada com login persistente e seguro.</Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Como funciona</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-4">1. Escolha o plano ideal para você.</Card>
          <Card className="p-4">2. Faça login ou crie conta no próprio checkout.</Card>
          <Card className="p-4">3. Pague via Pix e receba seu código imediatamente.</Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-4 space-y-3">
          <Card className="p-4">
            <strong>Quando recebo meu código?</strong>
            <p className="text-zinc-600">Assim que o pagamento for aprovado, de forma automática.</p>
          </Card>
          <Card className="p-4">
            <strong>Posso comprar novamente depois?</strong>
            <p className="text-zinc-600">Sim. Seu login permanece ativo para facilitar recompras.</p>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-4 py-6 text-sm text-zinc-600">
          <a href="#">Termos de uso</a>
          <a href="#">Política de privacidade</a>
          <a href="#">Suporte</a>
        </div>
      </footer>

      <CheckoutModal plan={selectedPlan} open={Boolean(selectedPlan)} onClose={() => setSelectedPlan(null)} />
    </main>
  );
}
