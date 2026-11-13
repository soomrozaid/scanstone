import { buildMatrix } from "@/lib/qr/matrix";
import { PressIn } from "./PressIn";

/** Three printed objects carrying the same code, rendered server-side as inline SVG. */
export function PrintArtifacts() {
  // Compact decorative renderer: each module (dot) or horizontal run (rounded)
  // is one stroked segment, so the three prints cost a few KB instead of ~90.
  const m = buildMatrix("https://scst.one/demo", "M");
  const q = 4;
  const N = m.size + q * 2;
  const qr = (fg: string, shape: "square" | "rounded" | "dot") => {
    let d = "";
    for (let r = 0; r < m.size; r++)
      for (let c = 0; c < m.size; c++) {
        if (!m.get(r, c)) continue;
        let len = 1;
        if (shape !== "dot") while (c + len < m.size && m.get(r, c + len)) len++;
        d += shape === "square" ? `M${c + q} ${r + q}h${len}v1h-${len}z` : `M${c + q + 0.5} ${r + q + 0.5}h${len - 1}`;
        c += len - 1;
      }
    if (shape === "rounded")
      // vertical runs too, so neighbours join into soft connected shapes
      for (let c = 0; c < m.size; c++)
        for (let r = 0; r < m.size; r++) {
          if (!m.get(r, c)) continue;
          let len = 1;
          while (r + len < m.size && m.get(r + len, c)) len++;
          if (len > 1) d += `M${c + q + 0.5} ${r + q + 0.5}v${len - 1}`;
          r += len - 1;
        }
    const body =
      shape === "square"
        ? `<path fill="${fg}" d="${d}"/>`
        : `<path fill="none" stroke="${fg}" stroke-width="${shape === "dot" ? 0.92 : 0.86}" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}"><rect width="${N}" height="${N}" fill="#ffffff"/>${body}</svg>`;
  };
  const items = [
    { label: "Table tent", cls: "w-[30%] aspect-[3/4] -rotate-3", fg: "#161411", shape: "rounded" as const, title: "Scan for the menu" },
    { label: "Business card", cls: "w-[38%] aspect-[7/4] rotate-2 translate-y-6", fg: "#1f5248", shape: "dot" as const, title: "Book online" },
    { label: "Poster", cls: "w-[26%] aspect-[3/4.2] -rotate-1", fg: "#b4642d", shape: "square" as const, title: "Tickets" },
  ];
  return (
    <PressIn>
    <div className="press-slot" aria-hidden="true"><span /></div>
    <div className="mt-8 flex items-end justify-center gap-3 sm:gap-5" aria-hidden="true">
      {items.map((it, i) => (
        <div key={it.label} className={`press-feed ${it.cls.split(" ")[0]}`} style={{ "--i": i } as React.CSSProperties}>
        <div
          className={`${it.cls.split(" ").slice(1).join(" ")} w-full press-sheet flex flex-col items-center justify-between rounded-lg border border-line bg-[#fbf8f1] p-2.5 shadow-[var(--shadow-card)] transition-transform duration-500 hover:rotate-0 sm:p-3`}
        >
          <span className="eyebrow text-center text-[0.5rem] text-ink-faint">{it.title}</span>
          <span className="press-ink relative block w-[62%] max-w-24">
            <span className="block [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr(it.fg, it.shape) }} />
            <span className="press-head" />
          </span>
          <span className="font-mono text-[0.5rem] text-ink-faint">{it.label}</span>
        </div>
        </div>
      ))}
    </div>
    </PressIn>
  );
}
