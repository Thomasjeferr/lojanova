import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { AdminCodesImportCard } from "@/components/admin/admin-codes-import-card";
import { AdminCodesTable } from "@/components/admin/admin-codes-table";

/** Alinhado ao default da API GET /api/admin/codes (limit). */
const CODES_LIST_PAGE_SIZE = 50;

export default async function AdminCodesPage() {
  const [plans, codesTotal, codes] = await Promise.all([
    prisma.plan.findMany({ orderBy: { durationDays: "asc" } }),
    prisma.activationCode.count(),
    prisma.activationCode.findMany({
      include: {
        plan: true,
        order: { include: { user: { select: { email: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: CODES_LIST_PAGE_SIZE,
      skip: 0,
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
        <AdminCodesImportCard
          plans={plans.map((p) => ({ id: p.id, title: p.title, durationDays: p.durationDays }))}
        />
      </SectionCard>
      <SectionCard
        title="Lista de códigos"
        subtitle="Use a busca por usuário, código ou e-mail; combine com status, plano e paginação (25, 50 ou 100 itens por página)."
      >
        <AdminCodesTable
          plans={plans.map((p) => ({ id: p.id, title: p.title, durationDays: p.durationDays }))}
          initialTotal={codesTotal}
          initialCodes={codes.map((c) => ({
            id: c.id,
            code: c.code,
            credentialType: c.credentialType,
            username: c.username,
            password: c.password,
            planId: c.planId,
            status: c.status,
            planTitle: c.plan.title,
            planDurationDays: c.plan.durationDays,
            orderEmail: c.order?.user?.email,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </SectionCard>
    </div>
  );
}
