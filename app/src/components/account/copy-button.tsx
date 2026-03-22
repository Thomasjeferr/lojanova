"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

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
  const [failed, setFailed] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    setFailed(false);
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 3500);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
        variant === "default" &&
          "bg-zinc-900 text-white hover:bg-zinc-800 px-3 py-2 shadow-sm",
        variant === "outline" &&
          "border border-zinc-200 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-50",
        !value && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {failed ? (
        <span className="rounded-lg bg-amber-100 px-2 py-1 text-center text-xs font-medium leading-snug text-amber-950">
          Não copiou — selecione o texto acima manualmente.
        </span>
      ) : copied ? (
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
