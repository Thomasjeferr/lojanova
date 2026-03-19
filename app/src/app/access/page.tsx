import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyCodeButton } from "@/components/copy-code-button";

export default async function AccessPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/");

  const deliveries = await prisma.delivery.findMany({
    where: { order: { userId: auth.userId } },
    include: { order: { include: { plan: true } }, activationCode: true },
    orderBy: { deliveredAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Meus acessos</h1>
      <div className="mt-6 space-y-3">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="rounded-lg border bg-white p-4">
            <p className="font-semibold">{delivery.order.plan.title}</p>
            <p className="mt-2 rounded border bg-zinc-50 p-2 font-mono">{delivery.activationCode.code}</p>
            <CopyCodeButton code={delivery.activationCode.code} />
          </div>
        ))}
      </div>
    </main>
  );
}
