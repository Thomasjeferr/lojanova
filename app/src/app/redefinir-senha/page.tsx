import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { BrandingLogo } from "@/components/branding-logo";
import { PasswordResetFlow } from "@/components/auth/password-reset-flow";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return {
    title: `Redefinir senha · ${b.storeDisplayName}`,
    description: `Recupere o acesso da sua conta em ${b.storeDisplayName}.`,
    robots: { index: false, follow: false },
  };
}

export default async function RedefinirSenhaPage() {
  const auth = await getAuthUser();
  if (auth) {
    if (auth.isAdmin) redirect("/admin");
    redirect("/account");
  }

  const branding = await getSiteBranding();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <BrandingLogo
            branding={branding}
            href="/"
            className="justify-center"
            textClassName="text-2xl"
            imgClassName="h-12 max-h-14 object-contain"
          />
        </div>
        <PasswordResetFlow />
      </div>
    </main>
  );
}
