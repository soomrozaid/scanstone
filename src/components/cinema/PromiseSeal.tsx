/** Spinning seal: the redirect promise set in a ring around a carved stone. */
export function PromiseSeal({ className = "" }: { className?: string }) {
  const text = "REDIRECTS NEVER EXPIRE \u2022 PAID OR NOT \u2022 CANCEL ANY TIME \u2022 ";
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="seal-spin absolute inset-0 h-full w-full">
        <defs>
          <path id="seal-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text className="fill-current font-mono text-[11.5px] tracking-[0.18em]">
          <textPath href="#seal-ring">{text + text.slice(0, 0)}</textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] flex items-center justify-center rounded-full bg-[#efe7d6] text-ink shadow-[0_0_80px_-10px_rgba(79,174,155,0.6)]">
        <div className="seal-bob text-center">
          <p className="display text-[clamp(1.4rem,3vw,2.4rem)] leading-none">$0</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">to keep codes alive</p>
        </div>
      </div>
    </div>
  );
}
