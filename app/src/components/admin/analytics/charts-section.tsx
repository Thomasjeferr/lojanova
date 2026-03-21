"use client";

import type { ReactNode } from "react";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, GitBranch, LineChart } from "lucide-react";
import type { AnalyticsChartsDTO } from "@/lib/activity-analytics";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { cn } from "@/lib/utils";

type ChartsSectionProps = {
  charts: AnalyticsChartsDTO;
  className?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    value?: number;
    payload?: { name?: string; label?: string; count?: number };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const row = payload[0]?.payload;
  const title = row?.name ?? row?.label ?? label ?? "";
  return (
    <div className="rounded-xl border border-white/12 bg-zinc-950/95 px-3.5 py-2.5 text-xs shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl ring-1 ring-violet-500/15">
      <p className="max-w-[220px] font-semibold leading-snug text-zinc-200">
        {title}
      </p>
      <p className="mt-1 tabular-nums text-violet-300">
        {typeof v === "number" ? v.toLocaleString("pt-BR") : "—"} eventos
      </p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  badge,
  children,
  className,
}: {
  title: string;
  icon: typeof LineChart;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "analytics-chart-cf-panel relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-zinc-950/78 p-5 backdrop-blur-xl",
        "shadow-[0_32px_80px_-34px_rgba(0,0,0,0.94),0_0_48px_-16px_rgba(139,92,246,0.1)] ring-1 ring-inset ring-white/[0.06]",
        "transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/22 hover:shadow-[0_36px_90px_-30px_rgba(139,92,246,0.22)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.45)]" />
          <h3 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>
        {badge}
      </div>
      <div className="relative min-h-[220px] flex-1">{children}</div>
    </div>
  );
}

export function ChartsSection({ charts, className }: ChartsSectionProps) {
  const uid = useId().replace(/:/g, "");

  const barData = useMemo(() => {
    if (charts.countries.length > 0) {
      return charts.countries.slice(0, 8).map((c) => ({
        name: `${countryCodeToFlagEmoji(c.code)} ${c.label}`,
        count: c.count,
      }));
    }
    return [{ name: "📡 Aguardando tráfego", count: 1 }];
  }, [charts.countries]);

  const syntheticTimeline = charts.timeline.length === 0;
  const lineData = useMemo(() => {
    if (charts.timeline.length > 0) {
      return charts.timeline.map((t) => ({
        label: t.label,
        count: t.count,
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      label: `+${i}h`,
      count: Math.max(1, Math.round(4 + Math.sin(i * 0.55) * 3 + (i % 3))),
    }));
  }, [charts.timeline]);

  const conv = charts.conversion;
  const convRatio =
    conv.accesses > 0
      ? Math.min(1, conv.purchases / conv.accesses)
      : conv.purchases > 0
        ? 1
        : 0;

  const funnelData = [
    { name: "Acessos", value: Math.max(0, conv.accesses), fill: "#22d3ee" },
    { name: "Compras", value: Math.max(0, conv.purchases), fill: "#a78bfa" },
  ];

  const barGradId = `barGrad-${uid}`;
  const areaGradId = `areaGrad-${uid}`;
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5",
        className,
      )}
    >
      <Panel
        title="Acessos por país"
        icon={BarChart3}
        badge={
          charts.countries.length === 0 ? (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
              Sem amostras
            </span>
          ) : null
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ left: 4, right: 16, top: 8, bottom: 8 }}
            barCategoryGap={10}
          >
            <defs>
              <linearGradient id={barGradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="55%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={118}
              stroke="#71717a"
              tick={{ fill: "#d4d4d8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                fill: "rgba(139, 92, 246, 0.08)",
                radius: 6,
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 8, 8, 0]}
              animationDuration={1400}
              animationEasing="ease-out"
            >
              {barData.map((_, i) => (
                <Cell
                  key={i}
                  fill={`url(#${barGradId})`}
                  className="drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        title="Volume ao longo do tempo"
        icon={LineChart}
        badge={
          syntheticTimeline ? (
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200/90">
              Prévia
            </span>
          ) : null
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={lineData}
            margin={{ left: 0, right: 8, top: 12, bottom: 4 }}
          >
            <defs>
              <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#e9d5ff"
              strokeWidth={2.5}
              fill={`url(#${areaGradId})`}
              animationDuration={1600}
              dot={{
                r: 3,
                fill: "#f5f3ff",
                strokeWidth: 0,
                stroke: "#a78bfa",
              }}
              activeDot={{
                r: 6,
                fill: "#c4b5fd",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Conversão acessos → compras" icon={GitBranch}>
        <div className="flex h-full min-h-[220px] flex-col gap-4">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="4 6"
                stroke="rgba(255,255,255,0.05)"
                horizontal={false}
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                stroke="#a1a1aa"
                tick={{ fill: "#e4e4e7", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Bar
                dataKey="value"
                radius={[0, 10, 10, 0]}
                animationDuration={1200}
              >
                {funnelData.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div>
            <div className="mb-2 flex justify-between text-xs text-zinc-500">
              <span>Proporção compras / acessos</span>
              <span className="tabular-nums font-semibold text-zinc-300">
                {(convRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-inset ring-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_24px_-2px_rgba(167,139,250,0.55)] transition-all duration-1000 ease-out"
                style={{ width: `${convRatio * 100}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Logins no período:{" "}
            <span className="font-semibold text-zinc-400">{conv.logins}</span>
          </p>
        </div>
      </Panel>
    </div>
  );
}
