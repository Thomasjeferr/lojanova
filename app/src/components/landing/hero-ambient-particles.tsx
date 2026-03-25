"use client";

/** Pontos de luz discretos — só CSS, leve (sem canvas). */
const PARTICLES: {
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: string;
  duration: string;
}[] = [
  { top: "12%", left: "8%", size: 3, delay: "0s", duration: "4.2s" },
  { top: "22%", right: "12%", size: 2, delay: "0.6s", duration: "5.1s" },
  { top: "38%", left: "18%", size: 2, delay: "1.1s", duration: "4.8s" },
  { top: "18%", left: "42%", size: 2, delay: "0.3s", duration: "6s" },
  { top: "48%", right: "22%", size: 3, delay: "0.9s", duration: "5.4s" },
  { top: "58%", left: "28%", size: 2, delay: "1.4s", duration: "4.5s" },
  { top: "32%", right: "28%", size: 2, delay: "0.2s", duration: "5.8s" },
  { top: "68%", left: "55%", size: 2, delay: "1.8s", duration: "4.9s" },
];

export function HeroAmbientParticles() {
  return (
    <div className="hero-particles pointer-events-none absolute inset-0 -z-[5]" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="hero-particle absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--theme-primary) 85%, white) 0%, transparent 70%)",
            boxShadow: `0 0 ${p.size * 4}px color-mix(in srgb, var(--theme-primary) 35%, transparent)`,
          }}
        />
      ))}
    </div>
  );
}
