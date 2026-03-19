import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteBranding } from "@/lib/site-branding";
import { AccountLayoutProvider } from "@/components/account/account-layout-context";
import { AccountLayoutWrapper } from "@/components/account/account-layout-wrapper";

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
