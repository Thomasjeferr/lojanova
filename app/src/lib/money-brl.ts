/**
 * Formatação / leitura de valores em reais no padrão BR para formulários admin.
 * O armazenamento no banco continua em centavos (inteiro).
 */

export function formatCentsAsBrlInput(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return "0,00";
  const [intPart, frac] = (cents / 100).toFixed(2).split(".");
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intWithDots},${frac}`;
}

export function parseBrlMoneyToCents(
  input: string,
): { ok: true; cents: number } | { ok: false; message: string } {
  const s = input
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "")
    .replace(/\u00a0/g, "");
  if (!s) return { ok: false, message: "Informe o preço." };

  let reaisStr: string;

  if (s.includes(",")) {
    const parts = s.split(",");
    if (parts.length !== 2 || parts[1].includes(",")) {
      return {
        ok: false,
        message: "Use o formato brasileiro, ex.: 49,90 ou 1.234,56.",
      };
    }
    const intDigits = parts[0].replace(/\./g, "").replace(/\D/g, "");
    if (!intDigits) return { ok: false, message: "Preço inválido." };
    let frac = parts[1].replace(/\D/g, "");
    if (frac.length > 2) frac = frac.slice(0, 2);
    frac = (frac + "00").slice(0, 2);
    reaisStr = `${intDigits}.${frac}`;
  } else if (/^\d+$/.test(s)) {
    reaisStr = `${s}.00`;
  } else if (/^\d+\.\d{1,2}$/.test(s)) {
    reaisStr = s;
  } else {
    return { ok: false, message: "Ex.: 49,90 · 100 · R$ 119,90" };
  }

  const n = Number(reaisStr);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: "Preço inválido." };
  }
  if (n > 999_999.99) {
    return { ok: false, message: "Preço acima do limite permitido." };
  }

  const cents = Math.round(n * 100);
  if (cents < 1) {
    return { ok: false, message: "O preço mínimo é R$ 0,01." };
  }

  return { ok: true, cents };
}
