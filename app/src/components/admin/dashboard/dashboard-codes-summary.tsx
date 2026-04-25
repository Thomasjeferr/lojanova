import { Key, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminPremiumCard,
  adminPremiumCardAccent,
  adminPremiumCardHeader,
  adminPremiumHeading,
  adminPremiumSub,
} from "@/lib/admin-premium-ui";

type DashboardCodesSummaryProps = {
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
};

function miniSparkline(seed: number, tone: "teal" | "purple") {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const v = 22 + ((seed * (i + 3)) % 37) + Math.sin(i * 0.6) * 8;
    return Math.max(8, Math.min(48, v));
  });
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "teal" ? "var(--accent-teal)" : "var(--accent-purple)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-95" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="admin-anim-draw-line"
      />
    </svg>
  );
}

export function DashboardCodesSummary({
  available,
  reserved,
  sold,
  blocked,
}: DashboardCodesSummaryProps) {
  const secondary = [
    reserved > 0 ? { key: "reserved", label: "Reservados (Pix)", value: reserved } : null,
    blocked > 0 ? { key: "blocked", label: "Bloqueados", value: blocked } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: number }>;

  if (available === 0 && reserved === 0 && sold === 0 && blocked === 0) return null;

  return (
    <section className={adminPremiumCard}>
      <div className={adminPremiumCardAccent} aria-hidden />
      <div className={cn(adminPremiumCardHeader, "sm:px-7")}>
        <h2 className={cn(adminPremiumHeading, "text-[var(--font-lg)]")}>Resumo de códigos</h2>
        <p className={adminPremiumSub}>Distribuição por status</p>
      </div>
      <div className="relative z-[2] space-y-4 p-6 sm:p-7">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-3)]/40 p-5 shadow-[var(--shadow-card)]",
              "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-hover)]",
            )}
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
                <Package className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[var(--font-xs)] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Disponíveis
                </p>
                <p className="text-[var(--font-3xl)] font-bold leading-none tabular-nums text-[var(--text-primary)]">
                  {available}
                </p>
              </div>
            </div>
            {miniSparkline(available + 11, "teal")}
          </div>
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-3)]/40 p-5 shadow-[var(--shadow-card)]",
              "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-hover)]",
            )}
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-purple-dim)] text-[var(--accent-purple)]">
                <Key className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[var(--font-xs)] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Vendidos
                </p>
                <p className="text-[var(--font-3xl)] font-bold leading-none tabular-nums text-[var(--text-primary)]">
                  {sold}
                </p>
              </div>
            </div>
            {miniSparkline(sold + 3, "purple")}
          </div>
        </div>

        {secondary.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
            {secondary.map((x) => (
              <div
                key={x.key}
                className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--bg-surface-1)]/40 px-3 py-1.5 text-[var(--font-sm)] font-semibold text-[var(--text-secondary)]"
              >
                <span className="text-[var(--text-muted)]">{x.label}</span>
                <span className="tabular-nums text-[var(--text-primary)]">{x.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
