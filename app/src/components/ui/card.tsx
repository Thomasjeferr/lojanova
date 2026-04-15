import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200/90 bg-white shadow-sm",
        "dark:border-zinc-700/55 dark:bg-zinc-900/75 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]",
        className,
      )}
      {...props}
    />
  );
}
