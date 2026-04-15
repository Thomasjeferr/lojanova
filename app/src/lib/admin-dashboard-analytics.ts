import { BR_TIMEZONE } from "@/lib/brazil-time";

export type DailySalesPoint = {
  dateKey: string;
  label: string;
  totalCents: number;
};

/** Avança `deltaDays` no calendário civil em Brasília a partir de uma chave YYYY-MM-DD. */
function addBrazilCalendarDays(dateKey: string, deltaDays: number): string {
  const t = new Date(`${dateKey}T12:00:00-03:00`);
  t.setUTCDate(t.getUTCDate() + deltaDays);
  return t.toLocaleDateString("en-CA", { timeZone: BR_TIMEZONE });
}

/** Série diária (últimos `dayCount` dias no fuso de Brasília) para gráfico de vendas. */
export function buildDailySalesSeries(
  paidOrders: { paidAt: Date | null; amountCents: number }[],
  dayCount: number,
): DailySalesPoint[] {
  const byDay = new Map<string, number>();
  for (const o of paidOrders) {
    if (!o.paidAt) continue;
    const key = o.paidAt.toLocaleDateString("en-CA", { timeZone: BR_TIMEZONE });
    byDay.set(key, (byDay.get(key) ?? 0) + o.amountCents);
  }

  const labelFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: BR_TIMEZONE,
  });

  const todayKey = new Date().toLocaleDateString("en-CA", {
    timeZone: BR_TIMEZONE,
  });

  const points: DailySalesPoint[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const dateKey = addBrazilCalendarDays(todayKey, -i);
    const label = labelFmt.format(new Date(`${dateKey}T12:00:00-03:00`));
    points.push({
      dateKey,
      label,
      totalCents: byDay.get(dateKey) ?? 0,
    });
  }
  return points;
}
