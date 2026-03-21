import { prisma } from "@/lib/prisma";
import { currencyBRL } from "@/lib/utils";
import { EmptyState } from "@/components/admin/empty-state";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getBrazilTodayStartUtc } from "@/lib/brazil-time";
import { DashboardPageHeader } from "@/components/admin/dashboard/dashboard-page-header";
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
  const soldCodes = codesByStatus.find((c) => c.status === "sold")?._count.id ?? 0;
  const blockedCodes =
    codesByStatus.find((c) => c.status === "blocked")?._count.id ?? 0;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-6 h-72 max-w-5xl rounded-full bg-gradient-to-b from-zinc-300/25 via-zinc-200/10 to-transparent blur-3xl sm:-top-10 sm:h-80"
        aria-hidden
      />

      <div className="relative space-y-8 lg:space-y-10">
        <DashboardPageHeader />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:gap-6">
          <DashboardMetricCard
            label="Total de vendas"
            value={currencyBRL(totalSales._sum.amountCents ?? 0)}
            icon={DollarSign}
            accent="violet"
          />
          <DashboardMetricCard
            label="Vendas hoje"
            value={currencyBRL(todaySales._sum.amountCents ?? 0)}
            hint="Fuso de Brasília"
            icon={TrendingUp}
            accent="emerald"
          />
          <DashboardMetricCard
            label="Pedidos pagos"
            value={ordersPaidCount}
            hint="Total histórico"
            icon={ShoppingCart}
            accent="blue"
          />
          <DashboardMetricCard
            label="Pedidos pendentes"
            value={ordersPendingCount}
            hint="Aguardando pagamento"
            icon={ShoppingCart}
            accent="amber"
          />
          <DashboardMetricCard
            label="Estoque disponível"
            value={totalStock}
            hint="Códigos prontos para venda"
            icon={Package}
            accent="slate"
          />
          <DashboardMetricCard
            label="Planos ativos"
            value={`${activePlans} / ${plans.length}`}
            hint="Ativos no catálogo"
            icon={Package}
            accent="rose"
          />
        </section>

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

        {availableCodes === 0 && soldCodes === 0 && blockedCodes === 0 ? (
          <section
            className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)]"
          >
            <div className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-5 sm:px-7">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                Resumo de códigos
              </h2>
              <p className="mt-1 text-sm text-zinc-500">Distribuição por status</p>
            </div>
            <div className="p-6 sm:p-7">
              <EmptyState
                icon={Package}
                title="Nenhum código cadastrado"
                description="Importe códigos na área de Códigos para ver o resumo por status."
                action={
                  <Link
                    href="/admin/codes"
                    className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
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
            sold={soldCodes}
            blocked={blockedCodes}
          />
        )}
      </div>
    </div>
  );
}
