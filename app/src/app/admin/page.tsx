import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminCodeImporter } from "@/components/admin-code-importer";
import { currencyBRL } from "@/lib/utils";

export default async function AdminPage() {
  const auth = await getAuthUser();
  if (!auth?.isAdmin) redirect("/");

  const [plans, totalSales, todaySales, stock, orders] = await Promise.all([
    prisma.plan.findMany({ orderBy: { durationDays: "asc" } }),
    prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: "paid" } }),
    prisma.order.aggregate({
      _sum: { amountCents: true },
      where: {
        status: "paid",
        paidAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.activationCode.groupBy({
      by: ["planId", "status"],
      _count: { id: true },
    }),
    prisma.order.findMany({
      include: { user: true, plan: true, activationCode: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-bold">Painel administrativo</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Total de vendas</p>
          <p className="text-2xl font-bold">{currencyBRL(totalSales._sum.amountCents || 0)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Vendas do dia</p>
          <p className="text-2xl font-bold">{currencyBRL(todaySales._sum.amountCents || 0)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Estoque total disponível</p>
          <p className="text-2xl font-bold">
            {stock.filter((s) => s.status === "available").reduce((acc, cur) => acc + cur._count.id, 0)}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Importar códigos</h2>
        <AdminCodeImporter plans={plans.map((p) => ({ id: p.id, title: p.title }))} />
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Últimos pedidos</h2>
        <div className="mt-3 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded border p-3 text-sm">
              <p>
                <strong>{order.user.email}</strong> - {order.plan.title}
              </p>
              <p>Status: {order.status === "paid" ? "Pago" : "Pendente"}</p>
              <p>Código: {order.activationCode?.code || "Ainda não entregue"}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
