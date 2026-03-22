import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function InputComponent({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "theme-focus-input w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
