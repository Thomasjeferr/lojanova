export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Remove zeros à esquerda para evitar links inválidos
  const noLeadingZeros = digits.replace(/^0+/, "");
  if (!noLeadingZeros) return "";

  // Se já vier com DDI (55...), mantém; caso contrário assume Brasil
  if (noLeadingZeros.startsWith("55")) {
    return noLeadingZeros;
  }
  return `55${noLeadingZeros}`;
}

export function isValidWhatsAppNumber(number: string): boolean {
  // E.164 simplificado para WhatsApp: entre 10 e 15 dígitos
  return /^\d{10,15}$/.test(number);
}

export function buildWhatsAppLink({
  number,
  message,
}: {
  number: string;
  message?: string | null;
}) {
  const normalized = normalizeWhatsAppNumber(number);
  if (!isValidWhatsAppNumber(normalized)) return "";
  const text = (message || "").trim();
  if (!text) return `https://wa.me/${normalized}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

