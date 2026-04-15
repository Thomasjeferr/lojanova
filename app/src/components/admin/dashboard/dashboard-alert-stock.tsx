import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { toAdminPath } from "@/lib/admin-path";

type DashboardAlertStockProps = {
  planTitles: string[];
};

export function DashboardAlertStock({ planTitles }: DashboardAlertStockProps) {
  if (planTitles.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-amber-200/55 bg-gradient-to-br from-amber-50/98 via-amber-50/55 to-orange-50/35 p-6 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_12px_40px_-16px_rgba(245,158,11,0.28)] dark:border-amber-500/35 dark:from-amber-950/85 dark:via-amber-950/45 dark:to-orange-950/35 dark:shadow-[0_0_0_1px_rgba(251,191,36,0.12)_inset,0_16px_48px_-12px_rgba(245,158,11,0.18)] sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 ring-1 ring-amber-200/60 dark:bg-amber-500/20 dark:ring-amber-500/30">
          <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-300" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-amber-950 dark:text-amber-100">
            Plano(s) sem estoque
          </h3>
          <p className="text-[15px] font-medium leading-relaxed tracking-tight text-amber-900/88 dark:text-amber-200/90">
            <span className="font-medium">{planTitles.join(", ")}</span>.
            Importe códigos para continuar vendendo sem interrupção.
          </p>
          <Link
            href={toAdminPath("codes")}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100"
          >
            Ir para códigos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
