import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { AdminPlanManager } from "@/components/admin-plan-manager";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { durationDays: "asc" },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Planos"
        subtitle="Crie e edite planos exibidos na landing. Defina preço, duração e benefícios."
      />
      <SectionCard>
        <AdminPlanManager
          initialPlans={plans.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            logoDataUrl: p.logoDataUrl,
            durationDays: p.durationDays,
            priceCents: p.priceCents,
            benefits: p.benefits,
            isActive: p.isActive,
            isFeatured: p.isFeatured,
          }))}
        />
      </SectionCard>
    </div>
  );
}
