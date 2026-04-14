export const DEFAULT_EVOLUTION_DELIVERY_TEMPLATE =
  "Olá {firstName}! Pagamento aprovado na {storeName}. Plano: {planName}. {credentialLabel}: {credentialValue}. Obrigado pela compra! Acesse: {accountUrl}/account";

export const DEFAULT_EVOLUTION_RECOVERY_TEMPLATE =
  "Olá {firstName}! Notamos o pedido {orderNumber} na {storeName} (plano {planName}) ainda em aberto. Ficou com alguma dúvida? Acesse {accountUrl}/account para concluir.";

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
