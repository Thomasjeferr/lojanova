import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { LandingPage } from "@/components/landing-page";
import type { Plan } from "@/components/landing/plan-card";
import { getPublicContactSettings } from "@/lib/contact-settings";

export const dynamic = "force-dynamic";

const MOCK_PLANS: Plan[] = [
  { id: "mock-30", title: "Plano 30 dias", logoDataUrl: null, durationDays: 30, priceCents: 4990, benefits: ["Acesso completo", "Ativação instantânea"], isFeatured: false },
  { id: "mock-90", title: "Plano 90 dias", logoDataUrl: null, durationDays: 90, priceCents: 11990, benefits: ["Mais vendido", "Melhor custo-benefício"], isFeatured: true },
  { id: "mock-365", title: "Plano 1 ano", logoDataUrl: null, durationDays: 365, priceCents: 34990, benefits: ["Economia máxima", "Acesso anual"], isFeatured: false },
];

export default async function Home() {
  let plans: Plan[];
  let dbConnected = true;

  try {
    plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { durationDays: "asc" },
      select: {
        id: true,
        title: true,
        logoDataUrl: true,
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

  const [auth, branding, contactSettings] = await Promise.all([
    getAuthUser(),
    getSiteBranding(),
    getPublicContactSettings(),
  ]);
  const userSession = auth ? { email: auth.email } : null;

  return (
    <LandingPage
      plans={plans}
      dbConnected={dbConnected}
      userSession={userSession}
      branding={branding}
      contactSettings={contactSettings}
    />
  );
}
