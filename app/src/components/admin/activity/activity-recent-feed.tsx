"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";
import type { ActivityRecentDTO } from "@/lib/activity-admin";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { currencyBRL } from "@/lib/utils";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { cn } from "@/lib/utils";

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
        "flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]",
        compact ? "max-h-[min(420px,55vh)]" : "max-h-[min(640px,70vh)]",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/95 to-white px-5 py-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-zinc-900">
            Atividade recente
          </h3>
          <p className="text-xs text-zinc-500">
            Atualização automática a cada ~{Math.round(pollMs / 1000)}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : (
            <Radio className="h-4 w-4 text-emerald-500" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => void pull()}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {events.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-zinc-500">
            Ainda não há eventos geolocalizados. Eles aparecem após logins,
            acessos à conta e compras confirmadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="group rounded-xl border border-transparent bg-zinc-50/50 px-3.5 py-3 transition hover:border-zinc-200/80 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg leading-none" aria-hidden>
                    {countryCodeToFlagEmoji(e.countryCode)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900">
                      {locationLine(e)}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-600">
                      {eventTitle(e)}
                    </p>
                    <p className="mt-1 text-[11px] font-medium tabular-nums text-zinc-400">
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
        <p className="border-t border-zinc-100 px-4 py-2 text-center text-[10px] text-zinc-400">
          Última sincronização: {formatDateTimePtBr(lastOk)}
        </p>
      ) : null}
    </div>
  );
}
