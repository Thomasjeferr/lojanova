import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/account/orders-table";

export default async function OrdersPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const orders = await prisma.order.findMany({
    where: { userId: auth.userId },
    include: { plan: true, activationCode: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.map((o) => ({
    id: o.id,
    planTitle: o.plan.title,
    durationDays: o.plan.durationDays,
    amountCents: o.amountCents,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    code: o.activationCode?.code ?? null,
    paidAt: o.paidAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-zinc-600">
          Histórico de pedidos e status. Clique em &quot;Ver detalhes&quot; para
          ver o código entregue.
        </p>
        <a
          href="/#planos"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
        >
          Comprar novamente
        </a>
      </div>
      <OrdersTable orders={rows} />
    </div>
  );
}
