import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccessPageClient } from "@/components/account/access-page-client";

export default async function AccessPage() {
  const auth = await getAuthUser();
  if (!auth) return null;

  const deliveries = await prisma.delivery.findMany({
    where: { order: { userId: auth.userId } },
    include: { order: { include: { plan: true } }, activationCode: true },
    orderBy: { deliveredAt: "desc" },
  });

  const access = deliveries.map((d) => ({
    id: d.id,
    planTitle: d.order.plan.title,
    durationDays: d.order.plan.durationDays,
    code: d.activationCode.code,
    deliveredAt: d.deliveredAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-zinc-600">
          Seus códigos de ativação entregues. Use &quot;Mostrar&quot; e
          &quot;Copiar&quot; quando precisar.
        </p>
        <a
          href="/#planos"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
        >
          Comprar novamente
        </a>
      </div>
      <AccessPageClient access={access} />
    </div>
  );
}
