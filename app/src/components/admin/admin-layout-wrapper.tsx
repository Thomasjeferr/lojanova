"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "./admin-shell";
import type { SiteBrandingPublic } from "@/lib/site-branding";

const routeTitles: Record<string, { title: string; subtitle?: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Visão geral do negócio" },
  "/admin/plans": { title: "Planos", subtitle: "Gerencie planos e preços" },
  "/admin/codes": { title: "Códigos", subtitle: "Importe e gerencie códigos de ativação" },
  "/admin/orders": { title: "Pedidos", subtitle: "Histórico e status dos pedidos" },
  "/admin/customers": { title: "Clientes", subtitle: "Base de clientes" },
  "/admin/settings": { title: "Configurações", subtitle: "Preferências do painel" },
  "/admin/emails": { title: "E-mails", subtitle: "Templates transacionais e testes" },
};

function getTitleForPath(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  for (const [path, config] of Object.entries(routeTitles)) {
    if (path !== "/admin" && pathname.startsWith(path)) return config;
  }
  return { title: "Admin", subtitle: "" };
}

type AdminLayoutWrapperProps = {
  children: React.ReactNode;
  userEmail?: string;
  branding: SiteBrandingPublic;
};

export function AdminLayoutWrapper({
  children,
  userEmail,
  branding,
}: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const { title, subtitle } = getTitleForPath(pathname ?? "");
  return (
    <AdminShell
      title={title}
      subtitle={subtitle}
      userEmail={userEmail}
      branding={branding}
    >
      {children}
    </AdminShell>
  );
}
