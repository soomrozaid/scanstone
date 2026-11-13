/**
 * Topographic contour lines, generated on the server: distorted rings around
 * two peaks, like a survey map of open prairie. The lines draw themselves in
 * and then breathe very slowly. Decorative only.
 */
function ring(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  const N = 72;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k =
      1 +
      0.13 * Math.sin(3 * a + seed) +
      0.07 * Math.sin(5 * a + seed * 1.7) +
      0.04 * Math.sin(9 * a - seed * 0.6);
    pts.push(`${(cx + Math.cos(a) * r * k * 1.35).toFixed(1)},${(cy + Math.sin(a) * r * k).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

export function Contours({ className = "" }: { className?: string }) {
  const peaks = [
    { cx: 980, cy: 260, n: 15, step: 34, seed: 1.3 },
    { cx: 260, cy: 640, n: 10, step: 40, seed: 4.1 },
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1400 800"
      preserveAspectRatio="xMidYMid slice"
      className={`contours pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {peaks.map((p, pi) => (
        <g key={pi} className="contour-g" style={{ transformOrigin: `${p.cx}px ${p.cy}px` }}>
          {Array.from({ length: p.n }, (_, i) => (
            <path
              key={i}
              d={ring(p.cx, p.cy, 22 + i * p.step, p.seed + i * 0.22)}
              pathLength={1}
              className={i % 5 === 4 ? "contour contour-major" : "contour"}
              style={{ ["--i" as string]: i + pi * 4 }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
