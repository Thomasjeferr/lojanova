"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyFeedbackButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "outline" | "theme" | "default";
  size?: "default" | "sm";
};

export function CopyFeedbackButton({
  text,
  label = "Copiar",
  copiedLabel = "Copiado com sucesso!",
  className,
  variant = "outline",
  size = "default",
}: CopyFeedbackButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2800);
    } catch {
      /* Clipboard pode falhar em contextos não seguros */
    }
  }, [text]);

  const v = variant === "theme" ? "theme" : variant === "default" ? "default" : "outline";

  return (
    <div className="w-full space-y-2">
      <Button
        type="button"
        variant={v}
        size={size}
        className={cn("w-full transition-colors", copied && "ring-2 ring-emerald-400/50", className)}
        onClick={onClick}
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0",
                variant === "theme" ? "text-white" : "text-emerald-600",
              )}
              aria-hidden
            />
            <span
              className={cn(
                "font-semibold",
                variant === "theme" ? "text-white" : "text-emerald-800",
              )}
            >
              {copiedLabel}
            </span>
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            {label}
          </>
        )}
      </Button>
      {copied ? (
        <p className="text-center text-xs font-medium text-emerald-700" role="status">
          Você já pode colar o conteúdo onde precisar.
        </p>
      ) : null}
    </div>
  );
}
