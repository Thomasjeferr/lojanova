"use client";

import {
  Loader2,
  LogIn,
  Radio,
  ScanLine,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { ActivityRecentDTO } from "@/lib/activity-admin";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { currencyBRL, cn } from "@/lib/utils";

function placeLabel(e: ActivityRecentDTO): string {
  const city = e.city?.trim();
  const country = e.country?.trim();
  if (city) return city;
  if (country) return country;
  if (e.countryCode) return e.countryCode;
  return "Local desconhecido";
}

/** Linha principal estilo “painel ao vivo”. */
export function activityLiveLine(e: ActivityRecentDTO): string {
  const place = placeLabel(e);
  if (e.type === "purchase" && e.amountCents != null) {
    return `${place} — Compra — ${currencyBRL(e.amountCents)}`;
  }
  if (e.type === "login") return `${place} — Login`;
  return `${place} — Novo acesso`;
}

function TypeIcon({ type }: { type: ActivityRecentDTO["type"] }) {
  if (type === "purchase")
    return (
      <ShoppingBag className="h-4 w-4 text-violet-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
    );
  if (type === "login")
    return (
      <LogIn className="h-4 w-4 text-blue-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.45)]" />
    );
  return (
    <ScanLine className="h-4 w-4 text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
  );
}

function typeMeta(type: ActivityRecentDTO["type"]): {
  text: string;
  className: string;
} {
  if (type === "purchase")
    return {
      text: "Compra",
      className:
        "border-violet-500/40 bg-violet-500/18 text-violet-100 shadow-[0_0_24px_-6px_rgba(139,92,246,0.55)]",
    };
  if (type === "login")
    return {
      text: "Login",
      className:
        "border-blue-500/40 bg-blue-500/15 text-blue-100 shadow-[0_0_22px_-6px_rgba(59,130,246,0.45)]",
    };
  return {
    text: "Acesso",
    className:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 shadow-[0_0_22px_-6px_rgba(16,185,129,0.4)]",
  };
}

type ActivityFeedProps = {
  events: ActivityRecentDTO[];
  loading?: boolean;
  pollMs: number;
  onManualRefresh?: () => void;
  className?: string;
  /** Cenário de demonstração (sem dados reais no filtro). */
  simulated?: boolean;
  /** Incrementa quando o evento mais recente muda (pulso no painel). */
  livePulseTick?: number;
};

export function ActivityFeed({
  events,
  loading = false,
  pollMs,
  onManualRefresh,
  className,
  simulated = false,
  livePulseTick = 0,
}: ActivityFeedProps) {
  return (
    <div
      className={cn(
        "relative flex max-h-[min(640px,72vh)] flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-zinc-950/82 shadow-[0_36px_100px_-38px_rgba(0,0,0,0.96),0_0_50px_-12px_rgba(139,92,246,0.12)] backdrop-blur-2xl",
        "ring-1 ring-inset ring-white/[0.07] transition duration-300 hover:border-violet-400/25 hover:shadow-[0_40px_110px_-30px_rgba(139,92,246,0.28)]",
        className,
      )}
    >
      {livePulseTick > 0 ? (
        <div
          key={livePulseTick}
          className="analytics-feed-live-flash-overlay absolute inset-0 z-[5] rounded-2xl"
          aria-hidden
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(139,92,246,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 3px)",
        }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.08] bg-gradient-to-r from-zinc-900/95 via-zinc-950 to-zinc-900/95 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
            </span>
            Atividade ao vivo
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Stream a cada {Math.round(pollMs / 1000)}s · {events.length}{" "}
            evento{events.length !== 1 ? "s" : ""}
            {simulated ? " · modo demonstração" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-violet-400/80" />
          ) : (
            <Radio className="h-4 w-4 text-emerald-400/90" aria-hidden />
          )}
          {onManualRefresh ? (
            <button
              type="button"
              onClick={onManualRefresh}
              className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-100 transition hover:border-violet-400/35 hover:bg-violet-500/15 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(139,92,246,0.45)] active:scale-[0.98]"
            >
              Atualizar
            </button>
          ) : null}
        </div>
      </div>

      {simulated ? (
        <div className="relative border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent px-4 py-2.5">
          <p className="flex items-center gap-2 text-[11px] font-medium text-amber-100/95">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
            Cenário de demonstração — os dados reais aparecem quando houver
            eventos neste filtro.
          </p>
        </div>
      ) : null}

      <div className="relative flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Radio className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="max-w-xs text-sm text-zinc-500">
              Nenhum evento neste filtro. Ajuste período ou tipo — ou aguarde
              tráfego.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {events.map((e, i) => {
              const meta = typeMeta(e.type);
              const isNewest = i === 0;
              const flag = countryCodeToFlagEmoji(e.countryCode);
              return (
                <li
                  key={e.id}
                  className={cn(
                    "analytics-feed-item group relative overflow-hidden rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5",
                    isNewest
                      ? "border-violet-500/40 bg-gradient-to-br from-violet-500/[0.14] via-zinc-900/50 to-zinc-950/70 shadow-[0_0_40px_-10px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/15"
                      : "border-white/[0.06] bg-zinc-900/40 hover:border-violet-500/20 hover:bg-zinc-900/65",
                  )}
                  style={{ animationDelay: `${Math.min(i, 14) * 42}ms` }}
                >
                  {isNewest ? (
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-400 via-fuchsia-400 to-cyan-400 opacity-90" />
                  ) : null}
                  <div className="flex gap-3">
                    <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
                      <span
                        className="text-2xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                        aria-hidden
                      >
                        {flag}
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/25">
                        <TypeIcon type={e.type} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            meta.className,
                          )}
                        >
                          {meta.text}
                        </span>
                        <span className="text-[11px] tabular-nums text-zinc-500">
                          {formatDateTimePtBr(e.createdAt, {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </span>
                        {isNewest ? (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                            Agora
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug text-zinc-100 transition group-hover:text-white">
                        {activityLiveLine(e)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
