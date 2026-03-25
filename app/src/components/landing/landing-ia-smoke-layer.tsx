"use client";

/**
 * Curvas orgânicas tipo “fumaça” / fluxo com neon do tema (mesma ideia do font-mockup).
 */
export function LandingIaSmokeLayer() {
  return (
    <svg
      className="landing-ia-smoke-svg"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="landing-ia-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.35 0"
            result="neon"
          />
          <feMerge>
            <feMergeNode in="neon" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="landing-ia-stroke-a" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.2" />
          <stop offset="35%" stopColor="var(--theme-gradient-via)" stopOpacity="0.95" />
          <stop offset="65%" stopColor="var(--theme-gradient-to)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--theme-text-gradient-end)" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="landing-ia-stroke-b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-gradient-to)" stopOpacity="0.25" />
          <stop offset="45%" stopColor="var(--theme-primary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--theme-gradient-from)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g filter="url(#landing-ia-neon-glow)">
        <path
          className="landing-ia-smoke-path"
          d="M -40 620 C 120 380 280 720 420 480 S 720 200 900 420 S 1080 680 1240 340"
          stroke="url(#landing-ia-stroke-a)"
          strokeWidth="1.35"
          strokeDasharray="14 28"
        />
        <path
          className="landing-ia-smoke-path landing-ia-smoke-path--b"
          d="M -20 180 C 200 420 340 80 520 300 S 780 760 980 420 S 1120 120 1260 500"
          stroke="url(#landing-ia-stroke-b)"
          strokeWidth="1.1"
          strokeDasharray="10 22"
        />
        <path
          className="landing-ia-smoke-path landing-ia-smoke-path--c"
          d="M 60 900 C 240 560 400 820 560 520 S 760 160 920 380 S 1040 640 1180 240"
          stroke="url(#landing-ia-stroke-a)"
          strokeWidth="0.85"
          opacity="0.75"
          strokeDasharray="8 18"
        />
        <path
          className="landing-ia-smoke-path landing-ia-smoke-path--d"
          d="M -60 420 C 160 220 320 580 500 320 S 700 40 880 280 S 1000 520 1220 180"
          stroke="url(#landing-ia-stroke-b)"
          strokeWidth="0.7"
          opacity="0.65"
          strokeDasharray="6 16"
        />
        <path
          className="landing-ia-smoke-path landing-ia-smoke-path--e"
          d="M 200 -40 C 320 180 480 40 640 220 S 860 520 1040 280 S 1140 80 1280 340"
          stroke="url(#landing-ia-stroke-a)"
          strokeWidth="0.9"
          opacity="0.55"
          strokeDasharray="12 24"
        />
      </g>
    </svg>
  );
}
