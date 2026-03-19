import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { LoginForm } from "@/components/login-form";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const auth = await getAuthUser();
  const { redirectTo } = await searchParams;
  if (auth) {
    if (auth.isAdmin) redirect("/admin");
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
