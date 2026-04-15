"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const PIE_COLORS_LIGHT = ["#6366f1", "#059669", "#d97706", "#64748b"];
const PIE_COLORS_DARK = ["#a5b4fc", "#34d399", "#fbbf24", "#94a3b8"];

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

function ChartShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(adminPremiumCard, "transition hover:shadow-[0_20px_56px_-28px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)_inset,0_36px_72px_-36px_rgba(0,0,0,0.9)]", className)}>
      <div className={adminPremiumCardAccent} aria-hidden />
      <div className={cn(adminPremiumCardHeader, "px-5 py-4 sm:px-6 sm:py-5")}>
        <h2 className={cn(adminPremiumHeading, "text-[1.0625rem]")}>{title}</h2>
        {subtitle ? <p className={cn(adminPremiumSub, "mt-1 text-[12px]")}>{subtitle}</p> : null}
      </div>
      <div className="relative z-[2] p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function DashboardAnalyticsCharts({
  dailySales,
  orderByStatus,
  planStockBars,
}: DashboardAnalyticsChartsProps) {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  const gridStroke = isDark ? "rgba(63,63,70,0.45)" : "rgba(228,228,231,0.85)";
  const axisColor = isDark ? "#a1a1aa" : "#52525b";
  const tooltipBg = isDark ? "rgba(24,24,27,0.96)" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(82,82,91,0.65)" : "rgba(228,228,231,0.95)";
  const tooltipShadow = isDark
    ? "0 24px 48px -12px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)"
    : "0 20px 40px -16px rgba(15,23,42,0.18), 0 0 0 1px rgba(0,0,0,0.04)";
  const strokePrimary = isDark ? "#a5b4fc" : "#4f46e5";
  const gradientTop = isDark ? "rgba(165,180,252,0.5)" : "rgba(79,70,229,0.4)";

  const salesData = useMemo(
    () =>
      dailySales.map((d) => ({
        ...d,
        totalReais: d.totalCents / 100,
      })),
    [dailySales],
  );

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

  const pieColors = isDark ? PIE_COLORS_DARK : PIE_COLORS_LIGHT;

  const barData = useMemo(() => {
    const keyCounts = new Map<string, number>();
    for (const p of planStockBars) {
      const k = `${p.title.trim().toLowerCase()}|${p.durationDays}`;
      keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1);
    }
    return planStockBars.map((p) => {
      const k = `${p.title.trim().toLowerCase()}|${p.durationDays}`;
      const duplicateTitleAndDuration = (keyCounts.get(k) ?? 0) > 1;
      const durationLabel =
        p.durationDays === 1 ? "1 dia" : `${p.durationDays} dias`;
      const base = `${p.title.trim()} · ${durationLabel}`;
      const fullTitle = duplicateTitleAndDuration
        ? `${base} · id ${p.planId.slice(0, 8)}…`
        : base;
      const nome =
        fullTitle.length > 44 ? `${fullTitle.slice(0, 42)}…` : fullTitle;
      return {
        nome,
        fullTitle,
        disponiveis: p.available,
      };
    });
  }, [planStockBars]);

  const hasSales = salesData.some((d) => d.totalCents > 0);
  const hasOrders = pieData.length > 0;
  const hasPlans = planStockBars.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <ChartShell
          title="Vendas por dia"
          subtitle="Últimos 30 dias · fuso de Brasília · pedidos pagos"
          className="xl:col-span-3"
        >
          <div className="h-[300px] w-full min-w-0">
            {!hasSales ? (
              <p className="flex h-full items-center justify-center px-4 text-center text-[13px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
                Ainda não há vendas registradas neste período.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminSalesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={strokePrimary} stopOpacity={isDark ? 0.42 : 0.32} />
                      <stop offset="55%" stopColor={strokePrimary} stopOpacity={isDark ? 0.12 : 0.08} />
                      <stop offset="100%" stopColor={strokePrimary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke={gridStroke} vertical={false} strokeOpacity={0.9} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: gridStroke }}
                    interval="preserveStartEnd"
                    minTickGap={24}
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
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      fontSize: "13px",
                      fontWeight: 500,
                      boxShadow: tooltipShadow,
                      padding: "12px 14px",
                    }}
                    labelStyle={{ color: axisColor, fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number) => [currencyBRL(Math.round(value * 100)), "Vendas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalReais"
                    name="Vendas"
                    stroke={strokePrimary}
                    strokeWidth={isDark ? 2.25 : 2}
                    fill="url(#adminSalesFill)"
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: isDark ? "#18181b" : "#fff",
                      fill: gradientTop,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>

        <ChartShell
          title="Pedidos por status"
          subtitle="Distribuição no catálogo completo"
          className="xl:col-span-2"
        >
          <div className="h-[300px] w-full min-w-0">
            {!hasOrders ? (
              <p className="flex h-full items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                Nenhum pedido para exibir.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2.5}
                    cornerRadius={6}
                    stroke={isDark ? "#18181b" : "#fafafa"}
                    strokeWidth={2}
                  >
                    {pieData.map((row, i) => (
                      <Cell key={row.key} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      fontSize: "13px",
                      fontWeight: 500,
                      boxShadow: tooltipShadow,
                      padding: "10px 12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-zinc-600 dark:text-zinc-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartShell>
      </div>

      <ChartShell
        title="Estoque por plano"
        subtitle="Códigos disponíveis para venda"
      >
        <div className="w-full min-w-0">
          {!hasPlans ? (
            <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum plano cadastrado.
            </p>
          ) : (
            <div
              className="w-full"
              style={{
                height: Math.min(420, Math.max(240, barData.length * 48)),
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 8, right: 20, left: 4, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="adminBarFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={isDark ? "#6366f1" : "#4f46e5"} stopOpacity={0.92} />
                      <stop offset="100%" stopColor={isDark ? "#a855f7" : "#7c3aed"} stopOpacity={0.88} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke={gridStroke} horizontal={false} strokeOpacity={0.85} />
                  <XAxis
                    type="number"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={200}
                    tick={{ fill: axisColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "14px",
                      fontSize: "13px",
                      fontWeight: 500,
                      boxShadow: tooltipShadow,
                      padding: "10px 12px",
                    }}
                    formatter={(value: number) => [value, "Disponíveis"]}
                    labelFormatter={(_, payload) => {
                      const p = payload as
                        | Array<{ payload?: { fullTitle?: string } }>
                        | undefined;
                      return p?.[0]?.payload?.fullTitle ?? "";
                    }}
                  />
                  <Bar
                    dataKey="disponiveis"
                    name="Disponíveis"
                    fill="url(#adminBarFill)"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </ChartShell>
    </div>
  );
}
