"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "default" | "outline";
};

export function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className,
  variant = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
        variant === "default" &&
          "bg-zinc-900 text-white hover:bg-zinc-800 px-3 py-2 shadow-sm",
        variant === "outline" &&
          "border border-zinc-200 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-50",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
