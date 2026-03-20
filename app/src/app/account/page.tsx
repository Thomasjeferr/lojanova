import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/account/dashboard-stats";
import { AccountDashboardClient } from "@/components/account/account-dashboard-client";
import { renderCredentialLine } from "@/lib/activation-credentials";

export default async function AccountDashboardPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const [user, orders, deliveries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true },
    }),
    prisma.order.findMany({
      where: { userId: auth.userId },
      include: { plan: true, activationCode: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.delivery.findMany({
      where: { order: { userId: auth.userId } },
      include: { order: { include: { plan: true } }, activationCode: true },
      orderBy: { deliveredAt: "desc" },
      take: 5,
    }),
  ]);

  const totalOrders = user
    ? await prisma.order.count({ where: { userId: user.id } })
    : 0;
  const paidOrders = orders.filter((o) => o.status === "paid");
  const lastOrder = orders[0] ?? null;
  const lastCode = deliveries[0]?.activationCode
    ? renderCredentialLine({
        credentialType: deliveries[0].activationCode.credentialType,
        code: deliveries[0].activationCode.code,
        username: deliveries[0].activationCode.username,
        password: deliveries[0].activationCode.password,
      })
    : null;

  return (
    <div className="space-y-8">
      <DashboardStats
        totalPurchases={totalOrders}
        activePlans={paidOrders.length}
        lastPurchaseDate={lastOrder?.createdAt ?? null}
        lastCode={lastCode}
      />
      <div className="flex flex-wrap gap-4">
        <Link
          href="/#planos"
          className="theme-btn-primary-lg inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold"
        >
          Comprar novo plano
        </Link>
        <Link
          href="/account/access"
          className="inline-flex items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Ver meus acessos
        </Link>
      </div>
      <AccountDashboardClient
        lastAccess={deliveries.map((d) => ({
          id: d.id,
          planTitle: d.order.plan.title,
          durationDays: d.order.plan.durationDays,
          code: renderCredentialLine({
            credentialType: d.activationCode.credentialType,
            code: d.activationCode.code,
            username: d.activationCode.username,
            password: d.activationCode.password,
          }),
          deliveredAt: d.deliveredAt,
        }))}
        lastOrders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          planTitle: o.plan.title,
          amountCents: o.amountCents,
          status: o.status,
          createdAt: o.createdAt,
        }))}
      />
    </div>
  );
}
