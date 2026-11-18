/** Odometer digits: each digit rolls to its new value. Screen readers get the plain number. */
export function RollingNumber({
  value,
  className = "",
  minDigits = 1,
}: {
  value: number | string;
  className?: string;
  minDigits?: number;
}) {
  const raw = String(value);
  const s = raw.padStart(minDigits, "0");
  const lead = s.length - raw.length;
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <span className="sr-only">{raw}</span>
      <span aria-hidden="true" className="inline-flex">
        {s.split("").map((ch, i) => {
          const d = Number(ch);
          const key = s.length - i;
          if (Number.isNaN(d)) return <span key={`c${key}`}>{ch}</span>;
          return (
            <span
              key={`d${key}`}
              className={`relative inline-block h-[1em] overflow-hidden leading-none transition-[max-width,opacity] duration-700 ${i < lead ? "max-w-0 opacity-0" : "max-w-[1em] opacity-100"}`}
            >
              <span
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateY(-${d * 10}%)` }}
              >
                {"0123456789".split("").map((n) => (
                  <span key={n} className="block h-[1em]">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
