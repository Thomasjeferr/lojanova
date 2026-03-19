"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  paid: {
    label: "Pago",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  delivered: {
    label: "Entregue",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
