import { Key } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

type DashboardCodesSummaryProps = {
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
};

export function DashboardCodesSummary({
  available,
  reserved,
  sold,
  blocked,
}: DashboardCodesSummaryProps) {
  const items = [
    {
      key: "available",
      label: "Disponíveis",
      value: available,
      className:
        "border-emerald-200/50 bg-emerald-50/50 text-emerald-900 ring-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-500/20",
      iconClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "reserved",
      label: "Reservados (Pix)",
      value: reserved,
      className:
        "border-amber-200/50 bg-amber-50/50 text-amber-950 ring-amber-500/10 dark:border-amber-500/30 dark:bg-amber-950/45 dark:text-amber-100 dark:ring-amber-500/20",
      iconClass: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "sold",
      label: "Vendidos",
      value: sold,
      className:
        "border-blue-200/50 bg-blue-50/50 text-blue-900 ring-blue-500/10 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-100 dark:ring-blue-500/20",
      iconClass: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "blocked",
      label: "Bloqueados",
      value: blocked,
      className:
        "border-red-200/50 bg-red-50/50 text-red-900 ring-red-500/10 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100 dark:ring-red-500/20",
      iconClass: "text-red-600 dark:text-red-400",
    },
  ].filter((x) => x.value > 0);

  if (items.length === 0) return null;

  return (
    <section className={adminPremiumCard}>
      <div className={adminPremiumCardAccent} aria-hidden />
      <div className={cn(adminPremiumCardHeader, "sm:px-7")}>
        <h2 className={cn(adminPremiumHeading, "text-[1.0625rem]")}>Resumo de códigos</h2>
        <p className={adminPremiumSub}>Distribuição por status</p>
      </div>
      <div className="relative z-[2] flex flex-wrap gap-3 p-6 sm:p-7">
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "flex min-w-[140px] flex-1 items-center gap-3 rounded-xl border px-4 py-3.5 ring-1 ring-inset sm:min-w-[160px]",
              item.className,
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04] dark:bg-zinc-900/50 dark:ring-white/10",
                item.iconClass,
              )}
            >
              <Key className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-85">
                {item.label}
              </p>
              <p className="text-[1.375rem] font-semibold tabular-nums tracking-[-0.02em]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
