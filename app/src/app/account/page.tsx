import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { orders: true },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Minha conta</h1>
      <p className="mt-2 text-zinc-600">Olá, {user?.name}. Bem-vindo à sua área do cliente.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link className="rounded-lg border bg-white p-4 hover:bg-zinc-50" href="/orders">
          Meus pedidos
        </Link>
        <Link className="rounded-lg border bg-white p-4 hover:bg-zinc-50" href="/access">
          Meus acessos
        </Link>
        <div className="rounded-lg border bg-white p-4">Compras realizadas: {user?.orders.length || 0}</div>
      </div>
    </main>
  );
}
