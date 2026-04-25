import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { cn } from "@/lib/utils";
import { toAdminPath } from "@/lib/admin-path";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

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
    <section className={cn(adminPremiumCard, "flex flex-col")}>
      <div className={adminPremiumCardAccent} aria-hidden />
      <div
        className={cn(
          adminPremiumCardHeader,
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-7",
        )}
      >
        <div>
          <h2 className={cn(adminPremiumHeading, "text-[var(--font-lg)]")}>Estoque por plano</h2>
          <p className={adminPremiumSub}>Códigos disponíveis para venda</p>
        </div>
        <Link
          href={toAdminPath("codes")}
          className="group inline-flex items-center gap-1 text-[var(--font-sm)] font-semibold text-[var(--accent-purple)] transition hover:brightness-110"
        >
          Gerenciar
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative z-[2] p-4 sm:p-6 sm:pt-5">
        {plans.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum plano"
            description="Crie planos em Planos para depois importar códigos."
            action={
              <Link
                href={toAdminPath("plans")}
                className="inline-flex items-center rounded-[var(--radius-md)] bg-[var(--accent-purple)] px-4 py-2.5 text-[var(--font-sm)] font-semibold text-white shadow-[var(--shadow-glow-purple)] transition hover:brightness-110"
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
                    "hover:border-zinc-200/80 hover:bg-white hover:shadow-sm dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {plan.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {plan.durationDays}{" "}
                      {plan.durationDays === 1 ? "dia" : "dias"} de acesso
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {plan.available === 0 ? (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                        Sem estoque
                      </span>
                    ) : null}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-white">
                        {plan.available}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
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
