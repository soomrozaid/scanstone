/** Native details/summary: works without JS, all answers stay in the HTML for search engines. */
export function Faq({
  items,
  allOpen = false,
}: {
  items: Array<{ q: string; a: string }>;
  allOpen?: boolean;
}) {
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
