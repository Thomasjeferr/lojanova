import type { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { recordAccessActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import { getSiteBranding } from "@/lib/site-branding";
import { AccountLayoutProvider } from "@/components/account/account-layout-context";
import { AccountLayoutWrapper } from "@/components/account/account-layout-wrapper";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return {
    title: `Minha conta · ${b.storeDisplayName}`,
    description: "Área do cliente, pedidos e códigos de ativação.",
    robots: { index: false, follow: false },
  };
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth) redirect("/entrar?redirectTo=account");

  const [user, branding] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, email: true },
    }),
    getSiteBranding(),
  ]);
  if (!user) redirect("/entrar");

  const h = await headers();
  after(() => recordAccessActivity(auth.userId, h));

  return (
    <AccountLayoutProvider>
      <AccountLayoutWrapper
        userName={user.name}
        userEmail={user.email}
        branding={branding}
      >
        {children}
      </AccountLayoutWrapper>
    </AccountLayoutProvider>
  );
}
