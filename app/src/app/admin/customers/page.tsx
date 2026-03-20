import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import {
  AdminCustomersTable,
  type AdminCustomerRow,
} from "@/components/admin/admin-customers-table";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          amountCents: true,
          createdAt: true,
          paidAt: true,
          plan: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const customers: AdminCustomerRow[] = users.map((u) => {
    const orders = u.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      amountCents: o.amountCents,
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
      planTitle: o.plan.title,
    }));

    const paidOrders = u.orders.filter((o) => o.status === "paid");
    const totalPaidCents = paidOrders.reduce((s, o) => s + o.amountCents, 0);

    let lastActivityAt: string | null = null;
    for (const o of paidOrders) {
      if (o.paidAt) {
        const t = o.paidAt.toISOString();
        if (!lastActivityAt || t > lastActivityAt) lastActivityAt = t;
      }
    }
    if (!lastActivityAt && u.orders.length > 0) {
      lastActivityAt = u.orders[0].createdAt.toISOString();
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      orderCount: u.orders.length,
      paidCount: paidOrders.length,
      totalPaidCents,
      lastActivityAt,
      orders,
    };
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes e histórico de compras."
      />
      <SectionCard
        title="Base de clientes"
        subtitle="Administradores não aparecem nesta lista. Use paginação (ex.: 100 por página) e clique na linha ou em Ver para o histórico."
      >
        <AdminCustomersTable initialCustomers={customers} />
      </SectionCard>
    </div>
  );
}
