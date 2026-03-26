import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { toAdminPath } from "@/lib/admin-path";

type DashboardAlertStockProps = {
  planTitles: string[];
};

export function DashboardAlertStock({ planTitles }: DashboardAlertStockProps) {
  if (planTitles.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/95 via-amber-50/50 to-orange-50/30 p-6 shadow-[0_4px_24px_-6px_rgba(245,158,11,0.25)] sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 ring-1 ring-amber-200/60">
          <AlertTriangle className="h-6 w-6 text-amber-700" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold text-amber-950">
            Plano(s) sem estoque
          </h3>
          <p className="text-sm leading-relaxed text-amber-900/85">
            <span className="font-medium">{planTitles.join(", ")}</span>.
            Importe códigos para continuar vendendo sem interrupção.
          </p>
          <Link
            href={toAdminPath("codes")}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-950"
          >
            Ir para códigos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
