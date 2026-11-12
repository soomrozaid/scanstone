import { DarkHero } from "./DarkHero";
import { SplitWords } from "./SplitWords";
import { ReadProgress } from "./ReadProgress";
import { LegalToc } from "./LegalToc";

/** Night header with a kinetic title, then the document with a live contents rail. */
export function LegalShell({
  title,
  effective,
  lead,
  ghost,
  children,
}: {
  title: string;
  effective: string;
  lead: string;
  ghost: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      <ReadProgress />
      <DarkHero glow="30% 40%">
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
          <p
            aria-hidden="true"
            className="legal-ghost display pointer-events-none absolute -bottom-[0.18em] right-0 select-none whitespace-nowrap text-[clamp(6rem,19vw,16rem)] italic leading-none text-paper/[0.05]"
          >
            {ghost}
          </p>
          <p className="rise font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">Legal</p>
          <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.03em]">
            <SplitWords text={title} start={60} />
          </h1>
          <p className="rise mt-6 max-w-xl text-lead text-paper/70 [animation-delay:300ms]">{lead}</p>
          <p className="rise mt-6 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1.5 font-mono text-xs text-paper/70 [animation-delay:420ms]">
            <span className="h-1.5 w-1.5 rounded-full bg-verdigris-bright" aria-hidden="true" />
            {effective}
          </p>
        </div>
      </DarkHero>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[15rem_1fr]">
        <LegalToc />
        <div data-legal className="max-w-3xl">
          {children}
        </div>
      </div>
    </main>
  );
}
