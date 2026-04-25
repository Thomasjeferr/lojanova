import { prisma } from "@/lib/prisma";
import { currencyBRL } from "@/lib/utils";
import { EmptyState } from "@/components/admin/empty-state";
import { Package } from "lucide-react";
import Link from "next/link";
import { getBrazilTodayStartUtc } from "@/lib/brazil-time";
import { DashboardMetricCard } from "@/components/admin/dashboard/dashboard-metric-card";
import {
  DashboardOrdersCard,
  type DashboardOrderRow,
} from "@/components/admin/dashboard/dashboard-orders-card";
import {
  DashboardStockCard,
  type DashboardPlanStockRow,
} from "@/components/admin/dashboard/dashboard-stock-card";
import { DashboardAlertStock } from "@/components/admin/dashboard/dashboard-alert-stock";
import { DashboardCodesSummary } from "@/components/admin/dashboard/dashboard-codes-summary";
import {
  getActivityDashboardSummary,
  getActivityMapPoints,
  getActivityRecent,
} from "@/lib/activity-admin";
import { ActivityGlobalSection } from "@/components/admin/activity/activity-global-section";
import { toAdminPath } from "@/lib/admin-path";
import { buildDailySalesSeries } from "@/lib/admin-dashboard-analytics";
import { DashboardAnalyticsCharts } from "@/components/admin/dashboard/dashboard-analytics-charts";

/** Janela de pedidos pagos alimentando o gráfico (≥ série de 90 dias no calendário). */
const CHART_LOOKBACK_MS = 96 * 24 * 60 * 60 * 1000;

export default async function AdminDashboardPage() {
  const [
    [
      plans,
      totalSales,
      todaySales,
      ordersPaidCount,
      ordersPendingCount,
      stockByPlan,
      recentOrders,
      codesByStatus,
      orderStatusGroups,
      paidOrdersForChart,
    ],
    [activityMapPoints, activitySummary, activityRecent],
  ] = await Promise.all([
    Promise.all([
      prisma.plan.findMany({ orderBy: { durationDays: "asc" } }),
      prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: "paid" } }),
      prisma.order.aggregate({
        _sum: { amountCents: true },
        where: {
          status: "paid",
          paidAt: { gte: getBrazilTodayStartUtc() },
        },
      }),
      prisma.order.count({ where: { status: "paid" } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.activationCode.groupBy({
        by: ["planId"],
        where: { status: "available" },
        _count: { id: true },
      }),
      prisma.order.findMany({
        include: { user: true, plan: true, activationCode: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.activationCode.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.findMany({
        where: {
          status: "paid",
          paidAt: {
            gte: (() => {
              const since = new Date();
              since.setTime(since.getTime() - CHART_LOOKBACK_MS);
              return since;
            })(),
          },
        },
        select: { paidAt: true, amountCents: true },
      }),
    ]),
    Promise.all([
      getActivityMapPoints(),
      getActivityDashboardSummary(),
      getActivityRecent(10),
    ]),
  ]);

  const totalStock = stockByPlan.reduce((acc, s) => acc + s._count.id, 0);
  const plansWithStock = new Map(stockByPlan.map((s) => [s.planId, s._count.id]));
  const plansWithZeroStock = plans.filter(
    (p) => (plansWithStock.get(p.id) ?? 0) === 0,
  );

  const activePlans = plans.filter((p) => p.isActive).length;

  const orderRows: DashboardOrderRow[] = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.user.email,
    planTitle: o.plan.title,
    amountCents: o.amountCents,
    status: o.status,
  }));

  const planStockRows: DashboardPlanStockRow[] = plans.map((p) => ({
    id: p.id,
    title: p.title,
    durationDays: p.durationDays,
    available: plansWithStock.get(p.id) ?? 0,
  }));

  const availableCodes =
    codesByStatus.find((c) => c.status === "available")?._count.id ?? 0;
  const reservedCodes =
    codesByStatus.find((c) => c.status === "reserved")?._count.id ?? 0;
  const soldCodes = codesByStatus.find((c) => c.status === "sold")?._count.id ?? 0;
  const blockedCodes =
    codesByStatus.find((c) => c.status === "blocked")?._count.id ?? 0;

  const dailySales = buildDailySalesSeries(paidOrdersForChart, 90);
  const orderByStatus = orderStatusGroups.map((g) => ({
    status: g.status,
    count: g._count.id,
  }));
  const planStockBars = planStockRows.map((p) => ({
    planId: p.id,
    title: p.title,
    durationDays: p.durationDays,
    available: p.available,
  }));

  return (
    <div className="relative">
      <div className="relative space-y-5">
        <header className="admin-section-head">
          <div className="admin-section-head__accent" aria-hidden />
          <div>
            <h1 className="admin-section-head__title">Visão geral</h1>
            <p className="admin-section-head__sub">
              Acompanhe vendas, pedidos, estoque e performance da loja em tempo real.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardMetricCard
            label="Total de vendas"
            value={currencyBRL(totalSales._sum.amountCents ?? 0)}
            icon="dollar-sign"
            accent="purple"
            countUp={{ kind: "cents", cents: totalSales._sum.amountCents ?? 0 }}
            className="admin-stagger-1"
          />
          <DashboardMetricCard
            label="Vendas hoje"
            value={currencyBRL(todaySales._sum.amountCents ?? 0)}
            hint="Fuso de Brasília"
            icon="trending-up"
            accent="teal"
            countUp={{ kind: "cents", cents: todaySales._sum.amountCents ?? 0 }}
            className="admin-stagger-2"
          />
          <DashboardMetricCard
            label="Pedidos pagos"
            value={ordersPaidCount}
            hint="Total histórico"
            icon="shopping-cart"
            accent="blue"
            countUp={{ kind: "int", value: ordersPaidCount }}
            className="admin-stagger-3"
          />
          <DashboardMetricCard
            label="Pedidos pendentes"
            value={ordersPendingCount}
            hint="Aguardando pagamento"
            icon="clock"
            accent="amber"
            countUp={{ kind: "int", value: ordersPendingCount }}
            className="admin-stagger-4"
          />
          <DashboardMetricCard
            label="Estoque disponível"
            value={totalStock}
            hint="Códigos prontos para venda"
            icon="package"
            accent="purpleMuted"
            countUp={{ kind: "int", value: totalStock }}
            className="admin-stagger-5"
          />
          <DashboardMetricCard
            label="Planos ativos"
            value={`${activePlans} / ${plans.length}`}
            hint="Ativos no catálogo"
            icon="layers"
            accent="tealMuted"
            className="admin-stagger-6"
          />
        </section>

        <DashboardAnalyticsCharts
          dailySales={dailySales}
          orderByStatus={orderByStatus}
          planStockBars={planStockBars}
        />

        <ActivityGlobalSection
          points={activityMapPoints}
          summary={activitySummary}
          initialRecent={activityRecent}
        />

        <DashboardAlertStock
          planTitles={plansWithZeroStock.map((p) => p.title)}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <DashboardOrdersCard orders={orderRows} />
          </div>
          <div className="lg:col-span-2">
            <DashboardStockCard plans={planStockRows} />
          </div>
        </div>

        {availableCodes === 0 &&
        reservedCodes === 0 &&
        soldCodes === 0 &&
        blockedCodes === 0 ? (
          <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-[0_12px_48px_-16px_rgba(0,0,0,0.55)]">
            <div className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-5 dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-900/40 sm:px-7">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Resumo de códigos
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Distribuição por status
              </p>
            </div>
            <div className="p-6 sm:p-7">
              <EmptyState
                icon={Package}
                title="Nenhum código cadastrado"
                description="Importe códigos na área de Códigos para ver o resumo por status."
                action={
                  <Link
                    href={toAdminPath("codes")}
                    className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Ir para códigos
                  </Link>
                }
              />
            </div>
          </section>
        ) : (
          <DashboardCodesSummary
            available={availableCodes}
            reserved={reservedCodes}
            sold={soldCodes}
            blocked={blockedCodes}
          />
        )}
      </div>
    </div>
  );
}
