/** Fuso usado em relatórios, “vendas hoje” e formatação no servidor (Vercel = UTC). */
export const BR_TIMEZONE = "America/Sao_Paulo";

/**
 * Início do dia civil em São Paulo (00:00), como `Date` em UTC (para comparar com `timestamptz` no Postgres).
 * Brasil sem horário de verão desde 2019; offset fixo UTC−3.
 */
export function getBrazilTodayStartUtc(now = new Date()): Date {
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: BR_TIMEZONE });
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, 3, 0, 0, 0));
}

export function formatDateTimePtBr(
  iso: Date | string | number,
  options?: { dateStyle?: "short" | "medium" | "long"; timeStyle?: "short" | "medium" },
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: options?.dateStyle ?? "short",
    timeStyle: options?.timeStyle ?? "short",
    timeZone: BR_TIMEZONE,
  }).format(new Date(iso));
}

export function formatDatePtBrShortMonth(iso: Date | string | number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: BR_TIMEZONE,
  }).format(new Date(iso));
}

export function formatDatePtBrNumeric(iso: Date | string | number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BR_TIMEZONE,
  }).format(new Date(iso));
}

/** Só data, estilo curto (ex.: 20/03/2026 em pt-BR). */
export function formatDateShortPtBr(iso: Date | string | number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: BR_TIMEZONE,
  }).format(new Date(iso));
}
