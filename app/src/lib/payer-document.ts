/** Apenas dígitos. */
export function normalizePayerDocument(raw: string): string {
  return raw.replace(/\D/g, "");
}

function cpfCheckDigit(base: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i]!, 10) * (factorStart - i);
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** CPF brasileiro (11 dígitos, dígitos verificadores válidos). CNPJ não é aceito. */
export function isValidPayerDocument(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const d9 = cpfCheckDigit(digits.slice(0, 9), 10);
  if (d9 !== parseInt(digits[9]!, 10)) return false;

  const d10 = cpfCheckDigit(digits.slice(0, 10), 11);
  if (d10 !== parseInt(digits[10]!, 10)) return false;

  return true;
}
