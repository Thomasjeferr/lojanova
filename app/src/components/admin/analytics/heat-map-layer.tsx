import type { ActivityMapPointDTO } from "@/lib/activity-admin";

export type HeatProjectedPoint = ActivityMapPointDTO & { x: number; y: number };

/**
 * Heatmap por intensidade relativa (0–1) ao máximo do conjunto atual.
 */
export function HeatMapLayer({
  projected,
  gradientId,
}: {
  projected: HeatProjectedPoint[];
  gradientId: string;
}) {
  const gid = `${gradientId}-blob`;
  const maxCount = Math.max(1, ...projected.map((p) => p.count));

  return (
    <g
      style={{ mixBlendMode: "screen" as const }}
      pointerEvents="none"
      aria-hidden
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(196, 181, 253)" stopOpacity={0.72} />
          <stop offset="40%" stopColor="rgb(139, 92, 246)" stopOpacity={0.35} />
          <stop offset="75%" stopColor="rgb(91, 33, 182)" stopOpacity={0.12} />
          <stop offset="100%" stopColor="rgb(30, 27, 75)" stopOpacity={0} />
        </radialGradient>
      </defs>
      {projected.map((p, i) => {
        const intensity = p.count / maxCount;
        const r = 20 + intensity * 48;
        const opacity = 0.1 + intensity * 0.62;
        return (
          <circle
            key={`heat-${p.lat}-${p.lng}-${i}`}
            cx={p.x}
            cy={p.y}
            r={r}
            fill={`url(#${gid})`}
            opacity={opacity}
            className="analytics-heat-cell"
            style={{ animationDelay: `${(i % 20) * 45}ms` }}
          />
        );
      })}
    </g>
  );
}
