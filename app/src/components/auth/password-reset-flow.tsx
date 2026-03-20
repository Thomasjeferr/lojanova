"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordResetFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isResetMode = Boolean(token);

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível solicitar a redefinição.");
        return;
      }
      setSuccess(data.message || "Se o e-mail existir, você receberá as instruções.");
      setEmail("");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
        return;
      }
      setSuccess(data.message || "Senha redefinida com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/entrar"), 1200);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-6">
      <h1 className="text-xl font-bold text-zinc-900">
        {isResetMode ? "Definir nova senha" : "Recuperar senha"}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        {isResetMode
          ? "Crie uma nova senha para voltar a acessar sua conta."
          : "Informe o e-mail da sua conta para receber o link de redefinição."}
      </p>

      <form onSubmit={isResetMode ? submitReset : submitForgot} className="mt-5 space-y-4">
        {isResetMode ? (
          <>
            <div>
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Enviando..."
            : isResetMode
              ? "Redefinir senha"
              : "Enviar link de redefinição"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        <Link href="/entrar" className="theme-link hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </Card>
  );
}
