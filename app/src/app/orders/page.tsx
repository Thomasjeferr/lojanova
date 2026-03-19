import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currencyBRL } from "@/lib/utils";

export default async function OrdersPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/");

  const orders = await prisma.order.findMany({
    where: { userId: auth.userId },
    include: { plan: true, activationCode: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Histórico de pedidos</h1>
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-white p-4">
            <p className="font-semibold">{order.plan.title}</p>
            <p className="text-sm text-zinc-600">Valor: {currencyBRL(order.amountCents)}</p>
            <p className="text-sm">Status: {order.status === "paid" ? "Pago" : "Aguardando pagamento"}</p>
            {order.activationCode?.code && <p className="text-sm">Código entregue: {order.activationCode.code}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
