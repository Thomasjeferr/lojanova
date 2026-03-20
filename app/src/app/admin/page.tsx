import { prisma } from "@/lib/prisma";
import { currencyBRL } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { SectionCard } from "@/components/admin/section-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Key,
} from "lucide-react";
import Link from "next/link";
import { displayOrderNumber } from "@/lib/order-ref";

export default async function AdminDashboardPage() {
  const [
    plans,
    totalSales,
    todaySales,
    ordersPaidCount,
    ordersPendingCount,
    stockByPlan,
    recentOrders,
    codesByStatus,
  ] = await Promise.all([
    prisma.plan.findMany({ orderBy: { durationDays: "asc" } }),
    prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: "paid" } }),
    prisma.order.aggregate({
      _sum: { amountCents: true },
      where: {
        status: "paid",
        paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
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
  ]);

  const totalStock = stockByPlan.reduce((acc, s) => acc + s._count.id, 0);
  const plansWithStock = new Map(stockByPlan.map((s) => [s.planId, s._count.id]));
  const plansWithZeroStock = plans.filter(
    (p) => (plansWithStock.get(p.id) ?? 0) === 0,
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do negócio e métricas principais"
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total de vendas"
          value={currencyBRL(totalSales._sum.amountCents ?? 0)}
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="Vendas hoje"
          value={currencyBRL(todaySales._sum.amountCents ?? 0)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Pedidos pagos"
          value={ordersPaidCount}
          subtitle="Total"
          icon={ShoppingCart}
          variant="default"
        />
        <StatCard
          title="Pedidos pendentes"
          value={ordersPendingCount}
          icon={ShoppingCart}
          variant="warning"
        />
        <StatCard
          title="Estoque disponível"
          value={totalStock}
          subtitle="códigos"
          icon={Package}
          variant="muted"
        />
        <StatCard
          title="Planos ativos"
          value={plans.filter((p) => p.isActive).length}
          subtitle={`de ${plans.length}`}
          icon={Package}
          variant="muted"
        />
      </section>

      {plansWithZeroStock.length > 0 && (
        <SectionCard title="Alertas">
          <div className="flex flex-wrap items-start gap-4 rounded-xl border border-amber-200/80 bg-amber-50/80 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-900">
                Plano(s) sem estoque
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {plansWithZeroStock.map((p) => p.title).join(", ")}. Importe
                códigos para continuar vendendo.
              </p>
              <Link
                href="/admin/codes"
                className="mt-3 inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-900"
              >
                Ir para Códigos →
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <SectionCard
          title="Últimos pedidos"
          subtitle="10 mais recentes"
          action={
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todos →
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum pedido ainda"
              description="Os pedidos aparecerão aqui quando os clientes começarem a comprar."
              action={
                <Link
                  href="/"
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Ver site
                </Link>
              }
            />
          ) : (
            <ul className="space-y-1">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/30 px-4 py-3.5 transition-colors hover:bg-zinc-50/60"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tabular-nums text-zinc-500">
                      {displayOrderNumber(order.orderNumber)}
                    </p>
                    <p className="truncate font-medium text-zinc-900">
                      {order.user.email}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {order.plan.title} · {currencyBRL(order.amountCents)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Estoque por plano"
          subtitle="Códigos disponíveis"
          action={
            <Link
              href="/admin/codes"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Gerenciar →
            </Link>
          }
        >
          {plans.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum plano"
              description="Crie planos em Planos para depois importar códigos."
              action={
                <Link
                  href="/admin/plans"
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Criar plano
                </Link>
              }
            />
          ) : (
            <ul className="space-y-1">
              {plans.map((plan) => {
                const available = plansWithStock.get(plan.id) ?? 0;
                return (
                  <li
                    key={plan.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/30 px-4 py-3.5"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{plan.title}</p>
                      <p className="text-sm text-zinc-500">
                        {plan.durationDays} dias
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {available === 0 && (
                        <span className="text-xs font-medium text-amber-600">
                          Sem estoque
                        </span>
                      )}
                      <span className="text-lg font-semibold tabular-nums text-zinc-900">
                        {available}
                      </span>
                      <span className="text-sm text-zinc-500">disponíveis</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Resumo de códigos" subtitle="Por status">
        <div className="flex flex-wrap gap-3">
          {(codesByStatus.find((c) => c.status === "available")?._count.id ??
            0) > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              <Key className="h-4 w-4" />
              {codesByStatus.find((c) => c.status === "available")?._count.id ??
                0}{" "}
              disponíveis
            </span>
          )}
          {(codesByStatus.find((c) => c.status === "sold")?._count.id ?? 0) >
            0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
              {codesByStatus.find((c) => c.status === "sold")?._count.id ?? 0}{" "}
              vendidos
            </span>
          )}
          {(codesByStatus.find((c) => c.status === "blocked")?._count.id ??
            0) > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
              {codesByStatus.find((c) => c.status === "blocked")?._count.id ??
                0}{" "}
              bloqueados
            </span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
