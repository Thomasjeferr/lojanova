"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminTheme } from "@/components/admin/admin-theme-context";
import { currencyBRL, cn } from "@/lib/utils";
import type { DailySalesPoint } from "@/lib/admin-dashboard-analytics";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pendentes",
  paid: "Pagos",
  failed: "Falhou",
  cancelled: "Cancelados",
};

export type OrderStatusSlice = {
  status: string;
  count: number;
};

export type PlanStockBar = {
  planId: string;
  title: string;
  durationDays: number;
  available: number;
};

type DashboardAnalyticsChartsProps = {
  dailySales: DailySalesPoint[];
  orderByStatus: OrderStatusSlice[];
  planStockBars: PlanStockBar[];
};

type PeriodKey = 7 | 30 | 90;

function ChartShell({
  title,
  subtitle,
  children,
  headerRight,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        adminPremiumCard,
        "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-hover)]",
        className,
      )}
    >
      <div className={adminPremiumCardAccent} aria-hidden />
      <div
        className={cn(
          adminPremiumCardHeader,
          "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5",
        )}
      >
        <div>
          <h2 className={cn(adminPremiumHeading, "text-[var(--font-lg)]")}>{title}</h2>
          {subtitle ? <p className={cn(adminPremiumSub, "mt-1 text-[var(--font-xs)]")}>{subtitle}</p> : null}
        </div>
        {headerRight}
      </div>
      <div className="relative z-[2] p-4 sm:p-6">{children}</div>
    </section>
  );
}

function periodTabs(active: PeriodKey, onChange: (p: PeriodKey) => void) {
  const opts: PeriodKey[] = [7, 30, 90];
  return (
    <div
      className="inline-flex rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-3)]/50 p-0.5"
      role="tablist"
      aria-label="Período do gráfico"
    >
      {opts.map((d) => {
        const isOn = active === d;
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={isOn}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-[var(--font-xs)] font-semibold uppercase tracking-wide transition-all duration-150",
              isOn
                ? "bg-[var(--accent-purple)] text-[var(--text-inverse)] shadow-[var(--shadow-glow-purple)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
            onClick={() => onChange(d)}
          >
            {d}d
          </button>
        );
      })}
    </div>
  );
}

function donutColor(status: string, theme: "light" | "dark") {
  const isDark = theme === "dark";
  if (status === "paid") return isDark ? "#00D4A1" : "#059669";
  if (status === "cancelled") return isDark ? "#FF4D6A" : "#e11d48";
  if (status === "pending") return isDark ? "#F59E0B" : "#d97706";
  if (status === "failed") return isDark ? "#3B82F6" : "#2563eb";
  return isDark ? "#8B90A7" : "#64748b";
}

function PlanStockBarsBlock({ rows }: { rows: Array<{ nome: string; disponiveis: number; fullTitle: string }> }) {
  const maxVal = useMemo(() => Math.max(1, ...rows.map((r) => r.disponiveis)), [rows]);
  return (
    <div className="space-y-5">
      {rows.map((row) => {
        const pct = Math.round((row.disponiveis / maxVal) * 100);
        const w = `${(row.disponiveis / maxVal) * 100}%`;
        const showInside = row.disponiveis / maxVal >= 0.14;
        return (
          <div key={row.fullTitle} className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[var(--font-sm)] text-[var(--text-primary)]">
              <span className="min-w-0 truncate font-medium" title={row.fullTitle}>
                {row.nome}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--text-primary)]">
                {row.disponiveis}
              </span>
            </div>
            <div
              className="relative h-7 w-full overflow-hidden rounded-[var(--radius-full)] bg-[var(--bg-surface-3)]"
              title={row.fullTitle}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-[var(--radius-full)] bg-[linear-gradient(90deg,var(--accent-purple),#A78BFA)] transition-[width] duration-700 ease-out"
                style={{ width: w }}
              />
              {showInside ? (
                <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold tabular-nums text-white mix-blend-normal drop-shadow-sm">
                  {pct}%
                </span>
              ) : (
                <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                  {pct}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardAnalyticsCharts({
  dailySales,
  orderByStatus,
  planStockBars,
}: DashboardAnalyticsChartsProps) {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";
  const [period, setPeriod] = useState<PeriodKey>(30);

  const gridStroke = "rgba(255,255,255,0.04)";
  const gridStrokeLight = "rgba(15,23,42,0.06)";
  const axisColor = "var(--text-muted)";
  const strokePrimary = "var(--accent-purple)";
  const tooltipBg = isDark ? "rgba(14,17,24,0.9)" : "rgba(255,255,255,0.96)";
  const tooltipBorder = "var(--border-default)";
  const tooltipShadow = "var(--shadow-card)";

  const salesData = useMemo(
    () =>
      dailySales.map((d) => ({
        ...d,
        totalReais: d.totalCents / 100,
      })),
    [dailySales],
  );

  const salesWindow = useMemo(() => {
    const n = period === 7 ? 7 : period === 30 ? 30 : Math.min(90, salesData.length);
    return salesData.slice(-n);
  }, [salesData, period]);

  const pieData = useMemo(
    () =>
      orderByStatus
        .filter((s) => s.count > 0)
        .map((s) => ({
          name: ORDER_STATUS_LABEL[s.status] ?? s.status,
          value: s.count,
          key: s.status,
        })),
    [orderByStatus],
  );

  const pieTotal = useMemo(() => pieData.reduce((a, b) => a + b.value, 0), [pieData]);

  const barData = useMemo(() => {
    const keyCounts = new Map<string, number>();
    for (const p of planStockBars) {
      const k = `${p.title.trim().toLowerCase()}|${p.durationDays}`;
      keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1);
    }
    return planStockBars.map((p) => {
      const k = `${p.title.trim().toLowerCase()}|${p.durationDays}`;
      const duplicateTitleAndDuration = (keyCounts.get(k) ?? 0) > 1;
      const durationLabel = p.durationDays === 1 ? "1 dia" : `${p.durationDays} dias`;
      const base = `${p.title.trim()} · ${durationLabel}`;
      const fullTitle = duplicateTitleAndDuration ? `${base} · id ${p.planId.slice(0, 8)}…` : base;
      const nome = fullTitle.length > 44 ? `${fullTitle.slice(0, 42)}…` : fullTitle;
      return {
        nome,
        fullTitle,
        disponiveis: p.available,
      };
    });
  }, [planStockBars]);

  const hasSales = salesWindow.some((d) => d.totalCents > 0);
  const hasOrders = pieData.length > 0;
  const hasPlans = planStockBars.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartShell
          title="Vendas por dia"
          subtitle="Pedidos pagos · fuso de Brasília"
          className="xl:col-span-2"
          headerRight={periodTabs(period, setPeriod)}
        >
          <div className="h-[300px] w-full min-w-0">
            {!hasSales ? (
              <p className="flex h-full items-center justify-center px-4 text-center text-[var(--font-sm)] font-medium text-[var(--text-secondary)]">
                Ainda não há vendas registradas neste período.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesWindow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminSalesFillPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7B61FF" stopOpacity={isDark ? 0.25 : 0.2} />
                      <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke={isDark ? gridStroke : gridStrokeLight}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: isDark ? gridStroke : gridStrokeLight }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("pt-BR", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(v as number)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 600,
                      boxShadow: tooltipShadow,
                      padding: "12px 14px",
                      color: "var(--text-primary)",
                    }}
                    labelStyle={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number) => [currencyBRL(Math.round(value * 100)), "Vendas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalReais"
                    name="Vendas"
                    stroke={strokePrimary}
                    strokeWidth={2.5}
                    fill="url(#adminSalesFillPremium)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "var(--bg-surface-2)",
                      fill: "#7B61FF",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>

        <ChartShell title="Pedidos por status" subtitle="Distribuição no catálogo completo">
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto h-[240px] w-full max-w-[280px] min-w-0">
              {!hasOrders ? (
                <p className="flex h-full items-center justify-center text-center text-[var(--font-sm)] text-[var(--text-secondary)]">
                  Nenhum pedido para exibir.
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={3}
                        cornerRadius={4}
                        stroke={isDark ? "#13161F" : "#f8fafc"}
                        strokeWidth={3}
                        isAnimationActive
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {pieData.map((row) => (
                          <Cell key={row.key} fill={donutColor(row.key, theme)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: tooltipBg,
                          backdropFilter: "blur(12px)",
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: "var(--radius-md)",
                          fontSize: "var(--font-sm)",
                          boxShadow: tooltipShadow,
                          padding: "10px 12px",
                          color: "var(--text-primary)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-1">
                    <span className="text-[28px] font-bold leading-none text-[var(--text-primary)] tabular-nums">
                      {pieTotal}
                    </span>
                    <span className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Total
                    </span>
                  </div>
                </>
              )}
            </div>
            {hasOrders ? (
              <ul className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
                {pieData.map((row) => {
                  const pct = pieTotal > 0 ? Math.round((row.value / pieTotal) * 100) : 0;
                  return (
                    <li
                      key={row.key}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--bg-surface-3)]/40 px-3 py-2 text-[var(--font-sm)]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: donutColor(row.key, theme) }}
                          aria-hidden
                        />
                        <span className="truncate font-medium text-[var(--text-primary)]">{row.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold text-[var(--text-secondary)]">
                        {row.value}{" "}
                        <span className="text-[var(--text-muted)]">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </ChartShell>
      </div>

      <ChartShell title="Estoque por plano" subtitle="Códigos disponíveis para venda">
        <div className="w-full min-w-0">
          {!hasPlans ? (
            <p className="py-12 text-center text-[var(--font-sm)] text-[var(--text-secondary)]">
              Nenhum plano cadastrado.
            </p>
          ) : (
            <PlanStockBarsBlock rows={barData} />
          )}
        </div>
      </ChartShell>
    </div>
  );
}
