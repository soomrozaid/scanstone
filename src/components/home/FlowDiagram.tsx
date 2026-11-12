/** Server-rendered explainer: phone → scst.one → destination, with a CSS-animated packet. */
export function FlowDiagram() {
  const nodes = [
    {
      k: "01",
      t: "Someone scans",
      d: "The printed pattern holds one short link that never changes.",
      mono: "scst.one/table04",
    },
    {
      k: "02",
      t: "Scanstone checks",
      d: "We look up where you want that link to go today and count the scan.",
      mono: "→ lookup · +1 scan",
    },
    {
      k: "03",
      t: "They land",
      d: "Your menu, booking page, listing or PDF opens. Change it whenever.",
      mono: "yourcafe.ca/menu",
    },
  ];
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute left-[16.6%] right-[16.6%] top-[34px] hidden h-px bg-gradient-to-r from-line via-ink/30 to-line md:block"
      >
        <span className="flow-packet absolute -top-[5px] left-0 h-[11px] w-[11px] rounded-full bg-verdigris shadow-[0_0_0_5px_rgb(44_110_99/0.15)]" />
      </div>
      <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        {nodes.map((n) => (
          <li key={n.k} className="text-center">
            <span className="relative z-10 mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border border-line bg-paper font-mono text-sm text-ink shadow-[var(--shadow-card)]">
              {n.k}
            </span>
            <h3 className="display mt-6 text-h3">{n.t}</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              {n.d}
            </p>
            <p className="mt-4 inline-block rounded-full border border-line bg-white/60 px-3 py-1 font-mono text-xs text-verdigris-deep">
              {n.mono}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
