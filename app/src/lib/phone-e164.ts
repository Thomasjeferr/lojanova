/**
 * Remove o DDI 55 só quando há 12+ dígitos (ex.: 5511999998888).
 * Com 11 dígitos começando em 55, os dois primeiros são o DDD (Roraima), não o país.
 */
export function stripBrazilCountryCodeIfPresent(digits: string): string {
  if (digits.startsWith("55") && digits.length > 11) return digits.slice(2);
  return digits;
}

/**
 * Converte telefone BR (máscara ou só dígitos, com ou sem DDI 55) para E.164 (+55...).
 */
export function brazilPhoneToE164(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const d = String(raw).replace(/\D/g, "");
  if (d.length === 0) return null;
  const withoutCountry = stripBrazilCountryCodeIfPresent(d);
  if (withoutCountry !== d) {
    if (withoutCountry.length === 10 || withoutCountry.length === 11) {
      return `+55${withoutCountry}`;
    }
    return null;
  }
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  return null;
}
