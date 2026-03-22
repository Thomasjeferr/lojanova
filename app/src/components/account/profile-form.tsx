"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { isValidPayerDocument, normalizePayerDocument } from "@/lib/payer-document";

type Profile = {
  name: string;
  email: string;
  phone: string | null;
  payerCpf: string | null;
};

type ProfileFormProps = {
  initialProfile: Profile | null;
};

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payerCpf, setPayerCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setEmail(initialProfile.email);
      setPhone(initialProfile.phone ?? "");
      const saved = initialProfile.payerCpf
        ? normalizePayerDocument(initialProfile.payerCpf)
        : "";
      setPayerCpf(isValidPayerDocument(saved) ? saved : "");
    }
  }, [initialProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const cpfDigits = normalizePayerDocument(payerCpf);
    if (cpfDigits.length > 0 && !isValidPayerDocument(cpfDigits)) {
      setError("Informe um CPF válido (11 dígitos) ou deixe em branco para remover.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          payerCpf: cpfDigits.length === 0 ? "" : cpfDigits,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao atualizar");
        setLoading(false);
        return;
      }
      setSuccess("Dados atualizados com sucesso.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="mt-1 bg-zinc-50"
          />
          <p className="mt-1 text-xs text-zinc-500">
            O e-mail não pode ser alterado aqui.
          </p>
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <Label htmlFor="payerCpf">CPF do pagador (Pix)</Label>
          <Input
            id="payerCpf"
            inputMode="numeric"
            autoComplete="off"
            value={payerCpf}
            onChange={(e) => {
              setPayerCpf(e.target.value.replace(/[^\d]/g, "").slice(0, 11));
              setError("");
            }}
            className="mt-1"
            placeholder="Opcional — 11 dígitos"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Usado para pré-preencher o checkout Pix. Deixe vazio para apagar o CPF salvo ou altere se
            outra pessoa costuma pagar.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}

type ChangePasswordFormProps = Record<string, never>;

export function ChangePasswordForm(_props: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao alterar senha");
        setLoading(false);
        return;
      }
      setSuccess("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-zinc-900">Alterar senha</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="currentPassword">Senha atual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
            required
            minLength={6}
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
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Alterando..." : "Alterar senha"}
        </Button>
      </form>
    </Card>
  );
}
