import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "theme-focus-input w-full rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500",
        className,
      )}
      {...props}
    />
  );
}
