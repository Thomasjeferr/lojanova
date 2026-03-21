import { Card } from "@/components/ui/card";
import { ShoppingBag, KeyRound, Calendar, Copy } from "lucide-react";
import { formatDatePtBrShortMonth } from "@/lib/brazil-time";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return formatDatePtBrShortMonth(d);
}

type DashboardStatsProps = {
  totalPurchases: number;
  activePlans: number;
  lastPurchaseDate: Date | null;
  lastCode: string | null;
};

export function DashboardStats({
  totalPurchases,
  activePlans,
  lastPurchaseDate,
  lastCode,
}: DashboardStatsProps) {
  const cards = [
    {
      label: "Total de compras",
      value: String(totalPurchases),
      icon: ShoppingBag,
    },
    {
      label: "Planos ativos",
      value: String(activePlans),
      icon: KeyRound,
    },
    {
      label: "Última compra",
      value: formatDate(lastPurchaseDate),
      icon: Calendar,
    },
    {
      label: "Código mais recente",
      value: lastCode ? `${lastCode.slice(0, 4)}••••${lastCode.slice(-4)}` : "—",
      icon: Copy,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="theme-icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">{item.label}</p>
                <p className="truncate text-lg font-semibold text-zinc-900">
                  {item.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
