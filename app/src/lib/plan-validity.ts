/**
 * Validade do acesso vendida com o plano (`Plan.durationDays`).
 * Usado em e-mail, SMS e WhatsApp após pagamento.
 */
export function formatPlanAccessValidityShort(durationDays: number): string {
  if (!Number.isFinite(durationDays) || durationDays <= 0) {
    return "conforme o plano";
  }
  const d = Math.floor(durationDays);
  if (d === 1) return "1 dia";
  return `${d} dias`;
}
