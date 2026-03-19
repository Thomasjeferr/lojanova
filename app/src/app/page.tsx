import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/landing-page";

export const dynamic = "force-dynamic";

const MOCK_PLANS = [
  { id: "mock-30", title: "Plano 30 dias", durationDays: 30, priceCents: 4990, benefits: ["Acesso completo", "Ativação instantânea"], isFeatured: false },
  { id: "mock-90", title: "Plano 90 dias", durationDays: 90, priceCents: 11990, benefits: ["Mais vendido", "Melhor custo-benefício"], isFeatured: true },
  { id: "mock-365", title: "Plano 1 ano", durationDays: 365, priceCents: 34990, benefits: ["Economia máxima", "Acesso anual"], isFeatured: false },
];

export default async function Home() {
  let plans: typeof MOCK_PLANS;
  let dbConnected = true;

  try {
    plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { durationDays: "asc" },
      select: {
        id: true,
        title: true,
        durationDays: true,
        priceCents: true,
        benefits: true,
        isFeatured: true,
      },
    });
  } catch {
    plans = MOCK_PLANS;
    dbConnected = false;
  }

  return <LandingPage plans={plans} dbConnected={dbConnected} />;
}
