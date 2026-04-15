import { cn } from "@/lib/utils";

export function AdminTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.125rem] border border-zinc-200/60 bg-white",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_22px_50px_-28px_rgba(15,23,42,0.14)]",
        "dark:border-zinc-600/35 dark:bg-zinc-900/82",
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_56px_-32px_rgba(0,0,0,0.82)]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-indigo-500/25 before:to-transparent dark:before:via-indigo-400/15",
        className,
      )}
    >
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="min-w-full divide-y divide-zinc-100 text-left text-sm dark:divide-zinc-800/90">
          {children}
        </table>
      </div>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gradient-to-b from-zinc-50/98 via-zinc-50/70 to-zinc-100/35 dark:from-zinc-900/95 dark:via-zinc-900/75 dark:to-zinc-950/85">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 sm:px-5",
        "dark:text-zinc-400",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="relative z-[2] divide-y divide-zinc-100/90 bg-white/[0.65] dark:divide-zinc-800/75 dark:bg-zinc-950/25">
      {children}
    </tbody>
  );
}

export function AdminTableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors duration-150",
        onClick &&
          "cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-zinc-800/70",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 align-top text-zinc-700 sm:px-5 dark:text-zinc-300",
        className,
      )}
    >
      {children}
    </td>
  );
}
