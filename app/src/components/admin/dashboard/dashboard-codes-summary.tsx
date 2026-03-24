import { Key } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "border-emerald-200/50 bg-emerald-50/50 text-emerald-900 ring-emerald-500/10",
      iconClass: "text-emerald-600",
    },
    {
      key: "reserved",
      label: "Reservados (Pix)",
      value: reserved,
      className:
        "border-amber-200/50 bg-amber-50/50 text-amber-950 ring-amber-500/10",
      iconClass: "text-amber-600",
    },
    {
      key: "sold",
      label: "Vendidos",
      value: sold,
      className: "border-blue-200/50 bg-blue-50/50 text-blue-900 ring-blue-500/10",
      iconClass: "text-blue-600",
    },
    {
      key: "blocked",
      label: "Bloqueados",
      value: blocked,
      className: "border-red-200/50 bg-red-50/50 text-red-900 ring-red-500/10",
      iconClass: "text-red-600",
    },
  ].filter((x) => x.value > 0);

  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)]",
      )}
    >
      <div className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-5 sm:px-7">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Resumo de códigos
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Distribuição por status</p>
      </div>
      <div className="flex flex-wrap gap-3 p-6 sm:p-7">
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
                "flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04]",
                item.iconClass,
              )}
            >
              <Key className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                {item.label}
              </p>
              <p className="text-xl font-semibold tabular-nums tracking-tight">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
