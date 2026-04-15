"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";
import type { ActivityRecentDTO } from "@/lib/activity-admin";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { currencyBRL } from "@/lib/utils";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { cn } from "@/lib/utils";
import { adminPremiumCard, adminPremiumCardAccent } from "@/lib/admin-premium-ui";

function eventTitle(e: ActivityRecentDTO): string {
  if (e.type === "purchase" && e.amountCents != null) {
    return `Compra · ${currencyBRL(e.amountCents)}`;
  }
  if (e.type === "login") return "Login na loja";
  return "Acesso à conta";
}

function locationLine(e: ActivityRecentDTO): string {
  const city = e.city?.trim();
  const country = e.country?.trim();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  if (e.countryCode) return e.countryCode;
  return "Localização desconhecida";
}

type ActivityRecentFeedProps = {
  initialEvents: ActivityRecentDTO[];
  pollMs?: number;
  compact?: boolean;
};

export function ActivityRecentFeed({
  initialEvents,
  pollMs = 28000,
  compact = false,
}: ActivityRecentFeedProps) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [lastOk, setLastOk] = useState<Date | null>(null);

  const pull = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/activity/recent?limit=${compact ? 12 : 45}`,
        { credentials: "same-origin" },
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.events)) {
        setEvents(data.events);
        setLastOk(new Date());
      }
    } catch {
      /* ignora */
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    const id = setInterval(() => void pull(), pollMs);
    return () => clearInterval(id);
  }, [pull, pollMs]);

  return (
    <div
      className={cn(
        adminPremiumCard,
        "flex flex-col",
        compact ? "max-h-[min(420px,55vh)]" : "max-h-[min(640px,70vh)]",
      )}
    >
      <div className={adminPremiumCardAccent} aria-hidden />
      <div className="relative z-[2] flex items-center justify-between gap-3 border-b border-zinc-100/90 bg-gradient-to-br from-zinc-50/98 via-white to-zinc-50/30 px-5 py-4 dark:border-zinc-800/70 dark:from-zinc-900/95 dark:via-zinc-900/75 dark:to-zinc-950/90">
        <div>
          <h3 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            Atividade recente
          </h3>
          <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
            Atualização automática a cada ~{Math.round(pollMs / 1000)}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400 dark:text-zinc-500" />
          ) : (
            <Radio className="h-4 w-4 text-emerald-500 dark:text-emerald-400" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => void pull()}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="relative z-[2] flex-1 overflow-y-auto p-3 sm:p-4">
        {events.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Ainda não há eventos geolocalizados. Eles aparecem após logins,
            acessos à conta e compras confirmadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="group rounded-xl border border-transparent bg-zinc-50/50 px-3.5 py-3 transition hover:border-zinc-200/80 hover:bg-white hover:shadow-sm dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:shadow-none"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg leading-none" aria-hidden>
                    {countryCodeToFlagEmoji(e.countryCode)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {locationLine(e)}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {eventTitle(e)}
                    </p>
                    <p className="mt-1 text-[11px] font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
                      {formatDateTimePtBr(e.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lastOk ? (
        <p className="relative z-[2] border-t border-zinc-100/90 px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
          Última sincronização: {formatDateTimePtBr(lastOk)}
        </p>
      ) : null}
    </div>
  );
}
