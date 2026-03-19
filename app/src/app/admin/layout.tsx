import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth?.isAdmin) redirect("/entrar");

  const branding = await getSiteBranding();

  return (
    <AdminLayoutWrapper userEmail={auth.email} branding={branding}>
      {children}
    </AdminLayoutWrapper>
  );
}
