import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { cn } from "@/lib/utils";

export type DashboardPlanStockRow = {
  id: string;
  title: string;
  durationDays: number;
  available: number;
};

type DashboardStockCardProps = {
  plans: DashboardPlanStockRow[];
};

export function DashboardStockCard({ plans }: DashboardStockCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)]",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            Estoque por plano
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Códigos disponíveis para venda
          </p>
        </div>
        <Link
          href="/admin/codes"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Gerenciar
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="p-4 sm:p-6 sm:pt-5">
        {plans.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum plano"
            description="Crie planos em Planos para depois importar códigos."
            action={
              <Link
                href="/admin/plans"
                className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Criar plano
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {plans.map((plan) => (
              <li key={plan.id}>
                <div
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-xl border border-transparent bg-zinc-50/40 px-4 py-4 transition duration-200",
                    "hover:border-zinc-200/80 hover:bg-white hover:shadow-sm",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">{plan.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {plan.durationDays}{" "}
                      {plan.durationDays === 1 ? "dia" : "dias"} de acesso
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {plan.available === 0 ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Sem estoque
                      </span>
                    ) : null}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950">
                        {plan.available}
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        disp.
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
