import { renderQRSvg } from "@/lib/qr/svg";

/** Three printed objects carrying the same code, rendered server-side as inline SVG. */
export function PrintArtifacts() {
  const qr = (fg: string, shape: "square" | "rounded" | "dot") =>
    renderQRSvg("https://scst.one/demo", { fg, bg: "#ffffff", shape });
  const items = [
    { label: "Table tent", cls: "w-[30%] aspect-[3/4] -rotate-3", fg: "#161411", shape: "rounded" as const, title: "Scan for the menu" },
    { label: "Business card", cls: "w-[38%] aspect-[7/4] rotate-2 translate-y-6", fg: "#1f5248", shape: "dot" as const, title: "Book online" },
    { label: "Poster", cls: "w-[26%] aspect-[3/4.2] -rotate-1", fg: "#b4642d", shape: "square" as const, title: "Tickets" },
  ];
  return (
    <div className="mt-8 flex items-end justify-center gap-3 sm:gap-5" aria-hidden="true">
      {items.map((it) => (
        <div
          key={it.label}
          className={`${it.cls} flex flex-col items-center justify-between rounded-lg border border-line bg-[#fbf8f1] p-2.5 shadow-[var(--shadow-card)] transition-transform duration-500 hover:rotate-0 sm:p-3`}
        >
          <span className="eyebrow text-center text-[0.5rem] text-ink-faint">{it.title}</span>
          <span
            className="block w-[62%] max-w-24 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qr(it.fg, it.shape) }}
          />
          <span className="font-mono text-[0.5rem] text-ink-faint">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
