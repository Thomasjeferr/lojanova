"use client";

/**
 * Malha estilo rede neural — SVG estático + animação leve em traços (só CSS).
 * Cores vêm de variáveis de tema (--landing-neural-*).
 */

const VB_W = 1600;
const VB_H = 900;

/** Nós distribuídos (layout fixo = cacheável pelo browser). */
const NODES: readonly [number, number][] = [
  [88, 120],
  [210, 72],
  [340, 140],
  [480, 56],
  [620, 118],
  [780, 64],
  [920, 132],
  [1080, 78],
  [1240, 110],
  [1420, 88],
  [1520, 168],
  [140, 260],
  [300, 220],
  [460, 280],
  [600, 200],
  [760, 250],
  [920, 210],
  [1080, 270],
  [1240, 230],
  [1380, 300],
  [1500, 260],
  [72, 400],
  [240, 380],
  [400, 440],
  [560, 360],
  [720, 420],
  [880, 380],
  [1040, 450],
  [1180, 400],
  [1340, 460],
  [1500, 400],
  [160, 540],
  [320, 500],
  [500, 580],
  [680, 520],
  [840, 580],
  [1000, 520],
  [1160, 580],
  [1320, 540],
  [1480, 600],
  [200, 680],
  [380, 720],
  [540, 660],
  [720, 740],
  [900, 680],
  [1080, 720],
  [1260, 680],
  [1420, 760],
  [1520, 640],
  [260, 820],
  [600, 800],
  [960, 840],
  [1280, 820],
];

/** Arestas [i, j] — grafo esparso orgânico. */
const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [0, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [11, 21],
  [21, 22],
  [22, 23],
  [23, 24],
  [24, 25],
  [25, 26],
  [26, 27],
  [27, 28],
  [28, 29],
  [29, 30],
  [21, 31],
  [31, 32],
  [32, 33],
  [33, 34],
  [34, 35],
  [35, 36],
  [36, 37],
  [37, 38],
  [38, 39],
  [39, 40],
  [31, 41],
  [41, 42],
  [42, 43],
  [43, 44],
  [44, 45],
  [45, 46],
  [46, 47],
  [47, 48],
  [48, 49],
  [49, 50],
  [12, 24],
  [18, 30],
  [5, 17],
  [8, 28],
  [2, 14],
  [25, 37],
  [1, 11],
  [20, 30],
  [40, 48],
  [6, 16],
  [13, 25],
  [22, 34],
  [27, 39],
  [0, 21],
  [10, 20],
  [42, 50],
  [3, 15],
  [9, 19],
  [33, 45],
  [36, 46],
];

function curvedEdge(a: [number, number], b: [number, number]): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(48, len * 0.12);
  const px = (-dy / len) * k;
  const py = (dx / len) * k;
  return `M ${a[0]} ${a[1]} Q ${mx + px} ${my + py} ${b[0]} ${b[1]}`;
}

function isPulseEdge(idx: number): boolean {
  return idx % 11 === 3 || idx % 17 === 5;
}

function isActiveNode(idx: number): boolean {
  return idx % 9 === 0 || idx % 13 === 4;
}

export function LandingNeuralGraphic() {
  return (
    <div className="landing-neural-wrap" aria-hidden>
      <svg
        className="landing-neural-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landing-neural-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--landing-neural-grad-a)" />
            <stop offset="52%" stopColor="var(--landing-neural-grad-b)" />
            <stop offset="100%" stopColor="var(--landing-neural-grad-c)" />
          </linearGradient>
          <linearGradient id="landing-neural-pulse" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="var(--landing-neural-pulse-a)" />
            <stop offset="45%" stopColor="var(--landing-neural-pulse-mid)" />
            <stop offset="100%" stopColor="var(--landing-neural-pulse-b)" />
          </linearGradient>
        </defs>

        <g
          className="landing-neural-edges landing-neural-edges--halo"
          fill="none"
          stroke="url(#landing-neural-stroke)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {EDGES.map(([i, j], idx) => (
            <path
              key={`h-${i}-${j}-${idx}`}
              d={curvedEdge(NODES[i]!, NODES[j]!)}
              className={isPulseEdge(idx) ? "landing-neural-edge landing-neural-edge--pulse" : "landing-neural-edge"}
              strokeWidth={isPulseEdge(idx) ? 2.6 : 1.55}
              opacity={isPulseEdge(idx) ? 0.66 : 0.42}
            />
          ))}
        </g>

        <g className="landing-neural-edges" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {EDGES.map(([i, j], idx) => {
            const a = NODES[i]!;
            const b = NODES[j]!;
            const d = curvedEdge(a, b);
            const pulse = isPulseEdge(idx);
            return (
              <path
                key={`${i}-${j}-${idx}`}
                d={d}
                className={pulse ? "landing-neural-edge landing-neural-edge--pulse" : "landing-neural-edge"}
                stroke={pulse ? "url(#landing-neural-pulse)" : "url(#landing-neural-stroke)"}
                strokeWidth={pulse ? 1.45 : 0.78}
                opacity={pulse ? 0.85 : 1}
              />
            );
          })}
        </g>

        <g className="landing-neural-nodes">
          {NODES.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 7 === 0 ? 3.2 : 1.85}
              className={`${i % 7 === 0 ? "landing-neural-node landing-neural-node--hub" : "landing-neural-node"} ${isActiveNode(i) ? "landing-neural-node--active" : ""}`}
              fill={i % 7 === 0 ? "var(--landing-neural-hub-fill)" : "var(--landing-neural-node-fill)"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
