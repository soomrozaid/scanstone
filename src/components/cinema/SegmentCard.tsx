import Link from "next/link";
import { AssembleQR } from "./AssembleQR";

const SHAPES = {
  tent: "w-[62%] aspect-[3/4] rounded-[10px] [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]",
  mirror: "w-[58%] aspect-[3/4] rounded-[999px_999px_18px_18px]",
  sign: "w-[70%] aspect-[4/3] rounded-[6px]",
  poster: "w-[56%] aspect-[2/3] rounded-[4px]",
  report: "w-[70%] aspect-[4/3] rounded-[14px]",
  box: "w-[60%] aspect-square rounded-[8px]",
} as const;

/** One business in the sideways gallery: what they print, and where the same code goes over time. */
export function SegmentCard({
  n,
  total,
  who,
  what,
  steps,
  shape,
  tint,
  href,
}: {
  n: number;
  total: number;
  who: string;
  what: string;
  steps: string[];
  shape: keyof typeof SHAPES;
  tint: string;
  href?: string;
}) {
  const body = (
    <article
      data-card
      className="group relative grid h-[min(68svh,560px)] w-[86vw] shrink-0 snap-start overflow-hidden rounded-[32px] border border-white/10 bg-night-raised sm:w-[min(72vw,980px)] sm:grid-cols-[1fr_0.9fr]"
    >
      <div className="relative z-10 flex flex-col p-7 sm:p-10">
        <p className="font-mono text-xs tracking-[0.2em] text-paper/45">
          {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <h3 className="display mt-4 text-[clamp(2rem,4.4vw,3.8rem)] leading-[0.95] tracking-[-0.02em]">{who}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/65 sm:text-base">{what}</p>
        <ol className="mt-auto flex flex-wrap items-center gap-2 pt-6 font-mono text-[11px]">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className="seg-step rounded-full border border-white/15 px-3 py-1.5 text-paper/70"
                style={{ animationDelay: `${i * 1.2}s`, animationDuration: `${steps.length * 1.2}s` }}
              >
                {s}
              </span>
              {i < steps.length - 1 && <span className="text-paper/30" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
        {href && <span className="mt-5 text-sm text-verdigris-bright">See how it works for menus →</span>}
      </div>
      <div className="relative hidden items-center justify-center sm:flex" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 55%, ${tint}, transparent 65%)` }} />
        <div data-par className="relative flex w-full items-center justify-center">
          <div className={`relative flex items-center justify-center bg-[#efe7d6] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transition-transform duration-700 group-hover:-rotate-2 group-hover:scale-[1.03] ${SHAPES[shape]}`}>
            <AssembleQR data={`https://scst.one/${shape}`} label="" className="w-[58%] !bg-transparent !p-0" />
          </div>
        </div>
      </div>
    </article>
  );
  return href ? (
    <Link href={href} className="shrink-0">
      {body}
    </Link>
  ) : (
    body
  );
}
