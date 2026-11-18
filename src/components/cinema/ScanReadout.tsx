"use client";

import { useEffect, useState } from "react";

/**
 * Viewfinder around a hero code: brackets lock on, a laser line sweeps, and a
 * readout types what a phone camera would actually decode from the pattern.
 * Reduced motion shows the full readout at once.
 */
export function ScanReadout({ children, payload, kind }: { children: React.ReactNode; payload: string; kind: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = window.setTimeout(() => setN(payload.length), 0);
      return () => clearTimeout(r);
    }
    let t = 0;
    let i = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < payload.length) t = window.setTimeout(tick, payload[i - 1] === "\n" ? 180 : 28);
      else t = window.setTimeout(() => { i = 0; setN(0); t = window.setTimeout(tick, 1400); }, 5200);
    };
    t = window.setTimeout(tick, 1700);
    return () => clearTimeout(t);
  }, [payload]);
  const done = n >= payload.length;
  return (
    <div className="sr-wrap relative mx-auto w-[300px]">
      <div className="sr-finder relative" aria-hidden="true">
        <span className="sr-c sr-tl" />
        <span className="sr-c sr-tr" />
        <span className="sr-c sr-bl" />
        <span className="sr-c sr-br" />
        <span className="sr-laser" />
      </div>
      <div className="relative">{children}</div>
      <div className="mt-8 rounded-2xl border border-night-line bg-night-raised/70 p-4 font-mono text-[11px] leading-relaxed text-paper/80 backdrop-blur" aria-hidden="true">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-paper/60">
          <span className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${n > 0 ? "bg-verdigris-bright shadow-[0_0_8px_2px_rgba(79,174,155,0.7)]" : "bg-paper/30"}`} />
            {n > 0 ? "Decoded" : "Scanning"}
          </span>
          <span>{kind}</span>
        </div>
        <pre className="min-h-[4.5em] whitespace-pre-wrap break-all text-paper">
          {payload.slice(0, n)}
          <span className={`sr-caret ${done ? "opacity-0" : ""}`}>▍</span>
        </pre>
      </div>
    </div>
  );
}
