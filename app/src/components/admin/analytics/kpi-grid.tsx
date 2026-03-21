"use client";

import {
  Activity,
  Globe2,
  Minus,
  Percent,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AnalyticsKpisDTO } from "@/lib/activity-analytics";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { cn } from "@/lib/utils";
import {
  useAnimatedInt,
  useAnimatedPercent,
  useKpiDeltas,
} from "@/hooks/use-animated-number";

type KpiGridProps = {
  kpis: AnalyticsKpisDTO;
  className?: string;
  loading?: boolean;
};

function DeltaBadge({
  delta,
  invert,
  decimals = 0,
}: {
  delta: number;
  invert?: boolean;
  decimals?: number;
}) {
  const eps = decimals > 0 ? 0.04 : 0.5;
  if (Math.abs(delta) < eps) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-zinc-500">
        <Minus className="h-3 w-3" aria-hidden />
        {decimals > 0 ? "0.0" : "0"}
      </span>
    );
  }
  const up = delta > 0;
  const positive = invert ? !up : up;
  const text =
    decimals > 0
      ? `${delta > 0 ? "+" : ""}${delta.toFixed(decimals)}`
      : `${delta > 0 ? "+" : ""}${delta}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1 ring-inset transition-colors",
        positive
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25 shadow-[0_0_16px_-4px_rgba(52,211,153,0.45)]"
          : "bg-rose-500/12 text-rose-300 ring-rose-500/20 shadow-[0_0_16px_-4px_rgba(244,63,94,0.35)]",
      )}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" aria-hidden />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden />
      )}
      {text}
    </span>
  );
}

export function KPIGrid({ kpis, className, loading = false }: KpiGridProps) {
  const deltas = useKpiDeltas(kpis);
  const convTarget = kpis.conversionRatePeriod * 100;
  const convDisplay = useAnimatedPercent(convTarget, 1100);
  const sessionsD = useAnimatedInt(kpis.sessionsOnline, 850);
  const accessD = useAnimatedInt(kpis.accessesToday, 850);
  const purchaseD = useAnimatedInt(kpis.purchasesToday, 850);
  const topFlag = countryCodeToFlagEmoji(kpis.topCountryCode);
  const topCountD = useAnimatedInt(kpis.topCountryCount, 800);

  const items = [
    {
      label: "Usuários online",
      sub: "Sessões válidas (estimado)",
      display: String(sessionsD),
      delta: deltas.sessionsOnline,
      deltaDecimals: 0,
      icon: Users,
      accent: "from-emerald-400/30 to-emerald-600/5",
      iconClass: "text-emerald-400",
      glow: "shadow-[0_0_28px_-6px_rgba(52,211,153,0.35)]",
      isCountry: false,
    },
    {
      label: "Acessos hoje",
      sub: "Tipo acesso · calendário Brasília",
      display: String(accessD),
      delta: deltas.accessesToday,
      deltaDecimals: 0,
      icon: Activity,
      accent: "from-cyan-400/30 to-cyan-600/5",
      iconClass: "text-cyan-400",
      glow: "shadow-[0_0_28px_-6px_rgba(34,211,238,0.3)]",
      isCountry: false,
    },
    {
      label: "Compras hoje",
      sub: "Confirmadas · Brasília",
      display: String(purchaseD),
      delta: deltas.purchasesToday,
      deltaDecimals: 0,
      icon: ShoppingBag,
      accent: "from-violet-400/35 to-fuchsia-600/8",
      iconClass: "text-violet-300",
      glow: "shadow-[0_0_32px_-6px_rgba(167,139,250,0.4)]",
      isCountry: false,
    },
    {
      label: "Taxa conversão",
      sub: "Compras ÷ acessos (período filtrado)",
      display: `${convDisplay.toFixed(1)}%`,
      delta: Math.round(deltas.conversionRatePeriod * 1000) / 10,
      deltaDecimals: 1,
      icon: Percent,
      accent: "from-amber-400/28 to-amber-600/6",
      iconClass: "text-amber-300",
      glow: "shadow-[0_0_28px_-6px_rgba(251,191,36,0.28)]",
      isCountry: false,
    },
    {
      label: "País mais ativo",
      sub:
        kpis.topCountryCount > 0
          ? `${kpis.topCountryCount} eventos no topo · período filtrado`
          : "Sem dados no período",
      display:
        kpis.topCountryCode && kpis.topCountryLabel
          ? `${topFlag} ${kpis.topCountryLabel}`
          : "—",
      secondary: kpis.topCountryCount > 0 ? String(topCountD) : null,
      delta: deltas.topCountryCount,
      deltaDecimals: 0,
      icon: Globe2,
      accent: "from-blue-400/30 to-indigo-600/6",
      iconClass: "text-blue-300",
      glow: "shadow-[0_0_28px_-6px_rgba(96,165,250,0.32)]",
      isCountry: true,
    },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4",
        className,
      )}
    >
      {items.map((item, cardIndex) => (
        <div
          key={item.label}
          className={cn(
            "analytics-kpi-cf-card group relative overflow-hidden rounded-2xl border border-white/[0.11] bg-zinc-950/88 p-4 backdrop-blur-xl",
            "shadow-[0_28px_72px_-30px_rgba(0,0,0,0.92),0_0_40px_-14px_rgba(139,92,246,0.08)] ring-1 ring-inset ring-white/[0.06]",
            "transition duration-300 ease-out hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_32px_80px_-26px_rgba(139,92,246,0.32),0_0_56px_-12px_rgba(167,139,250,0.15)]",
            loading && "analytics-kpi-loading",
          )}
          style={{ animationDelay: `${cardIndex * 140}ms` }}
        >
          <div
            className={cn(
              "pointer-events-none absolute -right-8 -top-14 h-32 w-32 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition duration-500 group-hover:opacity-100",
              item.accent,
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition group-hover:opacity-100",
            )}
          />
          <div className="relative flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition group-hover:scale-105 group-hover:border-white/20",
                item.iconClass,
                item.glow,
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {item.label}
                </p>
                {!item.isCountry ? (
                  <DeltaBadge delta={item.delta} decimals={item.deltaDecimals} />
                ) : item.delta !== 0 ? (
                  <DeltaBadge delta={item.delta} />
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-2 font-semibold tabular-nums tracking-tight text-white transition group-hover:text-white",
                  item.isCountry
                    ? "text-lg leading-snug sm:text-xl"
                    : "text-2xl sm:text-[1.75rem]",
                )}
              >
                {item.display}
              </p>
              {"secondary" in item && item.secondary ? (
                <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
                  {item.secondary} eventos (topo)
                </p>
              ) : null}
              <p className="mt-1 text-[11px] leading-snug text-zinc-500 transition group-hover:text-zinc-400">
                {item.sub}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
