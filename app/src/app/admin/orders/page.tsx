import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: true,
      activationCode: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe pagamentos e códigos entregues."
      />
      <SectionCard
        title="Todos os pedidos"
        subtitle="Ordenados pelos mais recentes"
      >
        <AdminOrdersTable
          initialOrders={orders.map((o) => ({
            id: o.id,
            userEmail: o.user.email,
            userName: o.user.name,
            planTitle: o.plan.title,
            amountCents: o.amountCents,
            status: o.status,
            createdAt: o.createdAt.toISOString(),
            paidAt: o.paidAt?.toISOString(),
            code: o.activationCode?.code,
          }))}
        />
      </SectionCard>
    </div>
  );
}
