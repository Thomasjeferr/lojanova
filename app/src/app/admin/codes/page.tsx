import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { AdminCodesImportCard } from "@/components/admin/admin-codes-import-card";
import { AdminCodesTable } from "@/components/admin/admin-codes-table";

export default async function AdminCodesPage() {
  const [plans, codes] = await Promise.all([
    prisma.plan.findMany({ orderBy: { durationDays: "asc" } }),
    prisma.activationCode.findMany({
      include: {
        plan: true,
        order: { include: { user: { select: { email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Códigos"
        subtitle="Importe códigos em massa e gerencie o estoque por plano."
      />
      <SectionCard
        title="Importar códigos"
        subtitle="Importe por tipo: código de ativação (16 chars) ou usuário/senha. Duplicados são ignorados."
      >
        <AdminCodesImportCard plans={plans.map((p) => ({ id: p.id, title: p.title }))} />
      </SectionCard>
      <SectionCard
        title="Lista de códigos"
        subtitle="Últimos 100. Use os filtros para refinar."
      >
        <AdminCodesTable
          plans={plans.map((p) => ({ id: p.id, title: p.title }))}
          initialCodes={codes.map((c) => ({
            id: c.id,
            code: c.code,
            credentialType: c.credentialType,
            username: c.username,
            password: c.password,
            planId: c.planId,
            status: c.status,
            planTitle: c.plan.title,
            orderEmail: c.order?.user?.email,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </SectionCard>
    </div>
  );
}
