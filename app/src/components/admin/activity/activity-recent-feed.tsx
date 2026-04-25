"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Radio } from "lucide-react";
import type { ActivityRecentDTO } from "@/lib/activity-admin";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { currencyBRL, cn } from "@/lib/utils";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { adminPremiumCard, adminPremiumCardAccent } from "@/lib/admin-premium-ui";

function locationLine(e: ActivityRecentDTO): string {
  const city = e.city?.trim();
  const country = e.country?.trim();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  if (e.countryCode) return e.countryCode;
  return "Localização desconhecida";
}

function formatRelativeShort(iso: string, nowMs: number) {
  const t = new Date(iso).getTime();
  const sec = Math.max(0, Math.round((nowMs - t) / 1000));
  if (sec < 50) return "agora";
  if (sec < 3600) return `há ${Math.max(1, Math.floor(sec / 60))} min`;
  if (sec < 86400) return `há ${Math.floor(sec / 3600)} h`;
  const d = Math.floor(sec / 86400);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

function accentForType(type: ActivityRecentDTO["type"]) {
  if (type === "login") return "border-l-[var(--accent-blue)]";
  if (type === "purchase") return "border-l-[var(--accent-teal)]";
  return "border-l-[var(--text-muted)]";
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
  const [nowTick, setNowTick] = useState(() => Date.now());

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

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        adminPremiumCard,
        "flex flex-col",
        compact ? "max-h-[min(420px,55vh)]" : "max-h-[min(640px,70vh)]",
      )}
    >
      <div className={adminPremiumCardAccent} aria-hidden />
      <div className="relative z-[2] flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/30 px-5 py-4">
        <div>
          <h3 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Atividade recente
          </h3>
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">
            Atualização automática a cada ~{Math.round(pollMs / 1000)}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
          ) : (
            <Radio className="h-4 w-4 text-[var(--accent-teal)]" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => void pull()}
            className={cn(
              "cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition",
              "hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]",
            )}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="relative z-[2] flex-1 overflow-y-auto p-3 sm:p-4">
        {events.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-[var(--text-secondary)]">
            Ainda não há eventos geolocalizados. Eles aparecem após logins, acessos à conta e compras
            confirmadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className={cn(
                  "rounded-[var(--radius-md)] border border-[var(--border-subtle)] border-l-[3px] bg-[var(--bg-surface-3)]/35 px-3 py-3 transition duration-150",
                  "hover:bg-[rgba(255,255,255,0.02)]",
                  accentForType(e.type),
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg leading-none" aria-hidden>
                    {countryCodeToFlagEmoji(e.countryCode)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{locationLine(e)}</p>
                    {e.type === "purchase" && e.amountCents != null ? (
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Compra ·{" "}
                        <span className="font-bold text-[var(--accent-teal)] tabular-nums">
                          {currencyBRL(e.amountCents)}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        {e.type === "login" ? "Login na loja" : "Acesso à conta"}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                      {formatRelativeShort(e.createdAt, nowTick)}
                      <span className="mx-1.5 text-[var(--border-strong)]">·</span>
                      <span className="text-[var(--text-muted)]">{formatDateTimePtBr(e.createdAt)}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lastOk ? (
        <p className="relative z-[2] border-t border-[var(--border-subtle)] px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Última sincronização: {formatDateTimePtBr(lastOk)}
        </p>
      ) : null}
    </div>
  );
}
