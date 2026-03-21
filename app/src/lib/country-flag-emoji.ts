/** Converte código ISO 3166-1 alpha-2 em emoji de bandeira (Unicode regional indicators). */
export function countryCodeToFlagEmoji(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🌐";
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  const A = 0x1f1e6;
  const chars = [...cc].map((c) => A + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}
