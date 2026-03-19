"use client";

import { usePathname } from "next/navigation";
import { AccountShell } from "./account-shell";
import type { SiteBrandingPublic } from "@/lib/site-branding";

const routeTitles: Record<string, { title: string; subtitle?: string }> = {
  "/account": { title: "Dashboard", subtitle: "Visão geral da sua conta" },
  "/account/access": { title: "Meus acessos", subtitle: "Códigos de ativação" },
  "/account/orders": { title: "Meus pedidos", subtitle: "Histórico de compras" },
  "/account/profile": { title: "Perfil", subtitle: "Seus dados e senha" },
};

function getTitleForPath(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  for (const [path, config] of Object.entries(routeTitles)) {
    if (path !== "/account" && pathname.startsWith(path)) return config;
  }
  return { title: "Minha conta", subtitle: "" };
}

type AccountLayoutWrapperProps = {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  branding: SiteBrandingPublic;
};

export function AccountLayoutWrapper({
  children,
  userName,
  userEmail,
  branding,
}: AccountLayoutWrapperProps) {
  const pathname = usePathname();
  const { title, subtitle } = getTitleForPath(pathname ?? "");
  return (
    <AccountShell
      title={title}
      subtitle={subtitle}
      userName={userName}
      userEmail={userEmail}
      branding={branding}
    >
      {children}
    </AccountShell>
  );
}
