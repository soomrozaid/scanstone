/** Native details/summary: works without JS, all answers stay in the HTML for search engines. */
export function Faq({
  items,
  allOpen = false,
  tone = "paper",
}: {
  items: Array<{ q: string; a: string }>;
  allOpen?: boolean;
  /** "night" is the cinematic variant: numbered rows, light sweep on hover, answers glide open. */
  tone?: "paper" | "night";
}) {
  if (tone === "night") {
    return (
      <div className="faq-night border-y border-paper/10">
        {items.map((f, k) => (
          <details key={f.q} className="group relative border-b border-paper/10 last:border-b-0" open={allOpen || k === 0}>
            <summary className="faq-row relative flex cursor-pointer list-none items-baseline gap-5 py-6 text-left [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="font-mono text-xs text-copper-bright tabular-nums">
                {String(k + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-lg font-medium text-paper transition-colors duration-300 sm:text-xl">{f.q}</span>
              <span
                aria-hidden="true"
                className="relative top-1 h-4 w-4 shrink-0 text-paper/60 transition-transform duration-500 ease-[var(--ease-settle)] group-open:rotate-[225deg] group-open:text-verdigris-bright"
              >
                <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
              </span>
            </summary>
            <p className="faq-answer max-w-2xl pb-7 pl-10 leading-relaxed text-paper/70">{f.a}</p>
          </details>
        ))}
      </div>
    );
  }
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, k) => (
        <details key={f.q} className="group py-1" open={allOpen || k === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <span
              aria-hidden="true"
              className="relative h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-45"
            >
              <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
              <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
