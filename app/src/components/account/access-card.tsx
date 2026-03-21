"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";
import { formatDateTimePtBr } from "@/lib/brazil-time";

type AccessCardProps = {
  planTitle: string;
  durationDays: number;
  code: string;
  credentialType: "activation_code" | "username_password";
  deliveredAt: Date | string;
  isRecent?: boolean;
};

function maskCode(code: string) {
  if (code.length <= 8) return "••••••••";
  return code.slice(0, 4) + "••••••••" + code.slice(-4);
}

export function AccessCard({
  planTitle,
  durationDays,
  code,
  credentialType,
  deliveredAt,
  isRecent,
}: AccessCardProps) {
  const [revealed, setRevealed] = useState(false);
  const displayCode = revealed ? code : maskCode(code);

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        isRecent && "ring-2 ring-[var(--theme-featured-ring)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-zinc-900">{planTitle}</p>
          <p className="text-sm text-zinc-500">{durationDays} dias de acesso</p>
          <p className="mt-1 text-xs text-zinc-400">
            Entregue em {formatDateTimePtBr(deliveredAt)}
          </p>
        </div>
        {isRecent && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--theme-soft)",
              color: "var(--theme-primary-foreground)",
            }}
          >
            Recente
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 font-mono text-sm text-zinc-800 whitespace-pre-wrap">
          {displayCode}
        </div>
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          {revealed ? "Ocultar" : "Mostrar"}
        </button>
        <CopyButton value={code} variant="default" />
        <span className="text-xs text-zinc-500">
          {credentialType === "username_password" ? "Formato: Usuario/Senha" : "Formato: Código"}
        </span>
      </div>
    </div>
  );
}
