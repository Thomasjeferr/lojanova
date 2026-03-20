/**
 * Converte telefone BR (máscara ou só dígitos, com ou sem DDI 55) para E.164 (+55...).
 */
export function brazilPhoneToE164(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const d = String(raw).replace(/\D/g, "");
  if (d.length === 0) return null;
  if (d.startsWith("55")) {
    const local = d.slice(2);
    if (local.length === 10 || local.length === 11) return `+55${local}`;
    return null;
  }
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  return null;
}
