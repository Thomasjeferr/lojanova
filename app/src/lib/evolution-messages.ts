export const DEFAULT_EVOLUTION_DELIVERY_TEMPLATE =
  "Olá {firstName}!\n\nSua compra na *{storeName}* foi aprovada.\n\n*Plano:* {planName}\n*Validade do acesso:* {validityLabel}\n\n*{credentialLabel}:*\n{credentialValue}\n\n*Sua conta:*\n{accountUrl}/account\n\nObrigado pela preferência!";

export const DEFAULT_EVOLUTION_RECOVERY_TEMPLATE =
  "Olá {firstName}!\n\nO pedido *{orderNumber}* na {storeName} (plano *{planName}*) ainda está aguardando pagamento.\n\nSe precisar de ajuda para concluir, acesse:\n{accountUrl}/account\n\nEstamos à disposição por aqui.";

export function renderEvolutionTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}
