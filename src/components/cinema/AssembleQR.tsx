import { buildMatrix } from "@/lib/qr/matrix";

/**
 * Server-rendered QR whose modules drop into place from the centre out, then
 * a light wave rolls across them on a loop. Real, scannable data.
 */
export function AssembleQR({
  data,
  className = "",
  label = "QR code",
  lite = false,
}: {
  data: string;
  className?: string;
  label?: string;
  /** One SVG path instead of a span per module: for pages with several codes. */
  lite?: boolean;
}) {
  const m = buildMatrix(data, "M");
  const n = m.size;
  if (lite) {
    let d = "";
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (m.get(r, c)) d += `M${c} ${r}h1v1h-1z`;
    const id = `aq-${data.replace(/[^a-z0-9]/gi, "")}`;
    return (
      <div role="img" aria-label={label || undefined} aria-hidden={label ? undefined : true} className={`assemble rounded-[14px] bg-[#efe7d6] p-[7%] ${className}`}>
        <svg viewBox={`0 0 ${n} ${n}`} className="qr-reveal block aspect-square w-full" shapeRendering="crispEdges">
          <defs>
            <clipPath id={id}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} className="fill-ink" />
          <rect className="qr-sweep fill-verdigris" x={-n * 0.25} y={0} width={n * 0.18} height={n} clipPath={`url(#${id})`} />
        </svg>
      </div>
    );
  }
  const cells: Array<[number, number, number]> = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (m.get(r, c)) cells.push([r, c, Math.hypot(r - n / 2, c - n / 2) / (n / 2)]);
  return (
    <div role="img" aria-label={label} className={`assemble rounded-[14px] bg-[#efe7d6] p-[7%] ${className}`}>
      <div className="relative aspect-square">
        {cells.map(([r, c, d]) => (
          <span
            key={`${r}-${c}`}
            className="assemble-cell absolute rounded-[1px] bg-ink"
            style={
              {
                left: `${(c / n) * 100}%`,
                top: `${(r / n) * 100}%`,
                width: `${100 / n + 0.25}%`,
                height: `${100 / n + 0.25}%`,
                "--d": `${Math.round(d * 900 + ((r * 7 + c * 13) % 9) * 30)}ms`,
                "--w": `${Math.round((c / n) * 1200)}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
