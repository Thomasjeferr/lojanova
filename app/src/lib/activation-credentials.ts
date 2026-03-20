import type { ActivationCredentialType } from "@prisma/client";

export type ActivationCredentialPayload = {
  credentialType: ActivationCredentialType;
  code: string;
  username: string | null;
  password: string | null;
};

export function renderCredentialLine(item: ActivationCredentialPayload): string {
  if (item.credentialType === "username_password") {
    const u = item.username?.trim() || "";
    const p = item.password?.trim() || "";
    return `Usuario: ${u}\nSenha: ${p}`;
  }
  return item.code;
}

export function credentialKindLabel(type: ActivationCredentialType): string {
  return type === "username_password" ? "Usuario + Senha" : "Codigo de ativacao";
}
