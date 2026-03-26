import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { LoginForm } from "@/components/login-form";
import { toAdminPath } from "@/lib/admin-path";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return {
    title: `Entrar · ${b.storeDisplayName}`,
    description: `Login para acessar sua conta e códigos de ativação em ${b.storeDisplayName}.`,
    robots: { index: false, follow: false },
  };
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const auth = await getAuthUser();
  const { redirectTo } = await searchParams;
  if (auth) {
    if (auth.isAdmin) redirect(toAdminPath());
    redirect("/account");
  }

  const redirectToProp =
    redirectTo === "account" ? "account" : redirectTo === "admin" ? "admin" : undefined;

  const branding = await getSiteBranding();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <LoginForm redirectTo={redirectToProp} branding={branding} />
    </main>
  );
}
