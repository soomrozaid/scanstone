/** Kinetic headline: each word rises out of a mask. Server-rendered text. */
export function SplitWords({
  text,
  start = 0,
  step = 70,
  className = "",
  wordClass = "",
}: {
  text: string;
  start?: number;
  step?: number;
  className?: string;
  wordClass?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span
            className={`kin inline-block ${wordClass}`}
            style={{ animationDelay: `${start + i * step}ms` }}
          >
            {w}
          </span>
          {i < words.length - 1 ? "\u00a0" : null}
        </span>
      ))}
    </span>
  );
}
