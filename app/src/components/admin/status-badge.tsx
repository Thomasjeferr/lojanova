import { cn } from "@/lib/utils";

type Status =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "available"
  | "sold"
  | "blocked"
  | "delivered";

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  paid: {
    label: "Pago",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-50 text-red-800 border-red-200/80",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200/80",
  },
  available: {
    label: "Disponível",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
  sold: {
    label: "Vendido",
    className: "bg-blue-50 text-blue-800 border-blue-200/80",
  },
  blocked: {
    label: "Bloqueado",
    className: "bg-red-50 text-red-700 border-red-200/80",
  },
  delivered: {
    label: "Entregue",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const config =
    statusConfig[status] ?? {
      label: String(status),
      className: "bg-zinc-100 text-zinc-600 border-zinc-200/80",
    };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
