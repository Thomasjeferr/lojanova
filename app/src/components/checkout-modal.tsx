"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { currencyBRL } from "@/lib/utils";

type Plan = {
  id: string;
  title: string;
  durationDays: number;
  priceCents: number;
};

export function CheckoutModal({
  plan,
  open,
  onClose,
}: {
  plan: Plan | null;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");

  const title = useMemo(() => {
    if (step === 1) return "Resumo do plano";
    if (step === 2) return "Identificação";
    if (step === 3) return "Pagamento via Pix";
    return "Pagamento aprovado";
  }, [step]);

  if (!open || !plan) return null;

  async function authAndContinue() {
    setLoading(true);
    setError("");
    try {
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!login.ok) {
        const register = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });
        if (!register.ok) {
          const data = await register.json();
          throw new Error(data.error || "Não foi possível entrar");
        }
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  }

  async function createPix() {
    if (!plan) return;
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      setOrderId(orderData.orderId);

      const pixRes = await fetch("/api/checkout/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const pixData = await pixRes.json();
      if (!pixRes.ok) throw new Error(pixData.error);
      setQrCode(pixData.qrCodeImage);
      setPixCode(pixData.brCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Pix");
    } finally {
      setLoading(false);
    }
  }

  async function checkPayment() {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/status?orderId=${orderId}`);
      const data = await res.json();
      if (data.status === "paid") {
        setDeliveryCode(data.code || "");
        setStep(4);
      } else {
        setError("Pagamento ainda não confirmado. Tente novamente em alguns segundos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <Card className="w-full max-w-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="text-sm text-zinc-500" onClick={onClose}>
            Fechar
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-zinc-600">Você está comprando:</p>
            <div className="rounded-lg border p-4">
              <p className="font-semibold">{plan.title}</p>
              <p className="text-sm text-zinc-600">Validade: {plan.durationDays} dias</p>
              <p className="text-lg font-bold text-blue-700">{currencyBRL(plan.priceCents)}</p>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar compra
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              Se você já tiver conta, faremos login automaticamente com e-mail e senha.
            </p>
            <Button className="w-full" onClick={authAndContinue} disabled={loading}>
              {loading ? "Processando..." : "Entrar e continuar"}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {!qrCode ? (
              <Button className="w-full" onClick={createPix} disabled={loading}>
                {loading ? "Gerando Pix..." : "Gerar Pix"}
              </Button>
            ) : (
              <>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code Pix" className="h-56 w-56 rounded-md border p-2" />
                </div>
                <div className="rounded-md border bg-zinc-50 p-3 text-xs break-all">{pixCode}</div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigator.clipboard.writeText(pixCode)}
                >
                  Copiar código Pix
                </Button>
                <Button className="w-full" onClick={checkPayment} disabled={loading}>
                  {loading ? "Verificando..." : "Já paguei, verificar agora"}
                </Button>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-green-600">Pagamento aprovado!</p>
            <p>Seu código de ativação foi liberado:</p>
            <div className="rounded-md border bg-zinc-50 p-4 font-mono text-lg">{deliveryCode}</div>
            <Button className="w-full" onClick={() => navigator.clipboard.writeText(deliveryCode)}>
              Copiar código
            </Button>
            <p className="text-xs text-zinc-500">
              Guarde este código. Ele também está disponível na sua área do cliente.
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </Card>
    </div>
  );
}
