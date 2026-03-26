"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import { toAdminPath } from "@/lib/admin-path";

export function LoginForm({
  redirectTo,
  branding,
}: {
  redirectTo?: "admin" | "account" | "home";
  branding: SiteBrandingPublic;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
      if (data.user?.isAdmin && (redirectTo === "admin" || !redirectTo)) {
        router.push(toAdminPath());
      } else if (redirectTo === "account") {
        router.push("/account");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Erro ao conectar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-6 flex justify-center">
        <BrandingLogo
          branding={branding}
          href="/"
          className="justify-center"
          textClassName="text-2xl"
          imgClassName="h-12 max-h-14 object-contain"
        />
      </div>
      <h1 className="mb-2 text-xl font-bold">Entrar</h1>
      <p className="mb-4 text-sm text-zinc-500">
        Use seu e-mail e senha para acessar a área do cliente ou o painel admin.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">Senha</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link href="/redefinir-senha" className="theme-link hover:underline">
          Esqueci minha senha
        </Link>
      </p>
      <p className="mt-4 text-center text-sm text-zinc-500">
        <Link href="/" className="theme-link hover:underline">
          Voltar para a página inicial
        </Link>
      </p>
    </Card>
  );
}
