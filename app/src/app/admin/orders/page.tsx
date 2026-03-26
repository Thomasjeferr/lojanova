import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { renderCredentialLine } from "@/lib/activation-credentials";
import { buildSourceLabel } from "@/lib/attribution";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: true,
      activationCode: {
        select: { code: true, status: true, credentialType: true, username: true, password: true },
      },
      delivery: { select: { id: true } },
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
        subtitle="Mais recentes primeiro. Busque por referência do pedido, e-mail ou nome; use paginação abaixo."
      >
        <AdminOrdersTable
          initialOrders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            userEmail: o.user.email,
            userName: o.user.name,
            planTitle: o.plan.title,
            amountCents: o.amountCents,
            status: o.status,
            createdAt: o.createdAt.toISOString(),
            paidAt: o.paidAt?.toISOString(),
            code: o.status === "paid" && o.activationCode?.status === "sold"
              ? renderCredentialLine({
                  credentialType: o.activationCode.credentialType,
                  code: o.activationCode.code,
                  username: o.activationCode.username,
                  password: o.activationCode.password,
                })
              : undefined,
            attributionSourceLabel: buildSourceLabel(o.attributionSource, o.attributionMedium),
            attributionCampaign: o.attributionCampaign,
            attributionReferrer: o.attributionReferrer,
            attributionLandingPath: o.attributionLandingPath,
            hasDelivery: Boolean(o.delivery),
          }))}
        />
      </SectionCard>
    </div>
  );
}
