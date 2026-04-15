import { cn } from "@/lib/utils";

type Status =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "available"
  | "reserved"
  | "sold"
  | "blocked"
  | "delivered";

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pendente",
    className:
      "border-amber-200/80 bg-amber-50/95 text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/50 dark:text-amber-200",
  },
  paid: {
    label: "Pago",
    className:
      "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-200",
  },
  failed: {
    label: "Falhou",
    className:
      "border-red-200/80 bg-red-50/95 text-red-900 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-200",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "border-zinc-200/90 bg-zinc-100/90 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
  available: {
    label: "Disponível",
    className:
      "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-200",
  },
  reserved: {
    label: "Reservado (Pix)",
    className:
      "border-amber-200/80 bg-amber-50/95 text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/55 dark:text-amber-100",
  },
  sold: {
    label: "Vendido",
    className:
      "border-blue-200/80 bg-blue-50/95 text-blue-900 dark:border-blue-500/35 dark:bg-blue-950/45 dark:text-blue-200",
  },
  blocked: {
    label: "Bloqueado",
    className:
      "border-red-200/80 bg-red-50/95 text-red-900 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-200",
  },
  delivered: {
    label: "Entregue",
    className:
      "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-200",
  },
};

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: Status;
  className?: string;
  /** `md`: destaque para listas premium (ex.: dashboard) */
  size?: "sm" | "md";
}) {
  const config = statusConfig[status] ?? {
    label: String(status),
    className:
      "border-zinc-200/80 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium",
        size === "sm" && "rounded-full px-2.5 py-1 text-xs",
        size === "md" &&
          "gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        config.className,
        className,
      )}
    >
      {size === "md" ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50"
          aria-hidden
        />
      ) : null}
      {config.label}
    </span>
  );
}
