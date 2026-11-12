"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small dial that docks at the bottom left once you're into the article:
 * the ring fills as you read and the minutes count down to "Done".
 */
export function ReadingDial({ minutes }: { minutes: number }) {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    const art = document.querySelector<HTMLElement>("[data-article]");
    if (!art) return;
    const on = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = art.getBoundingClientRect();
        const total = r.height - innerHeight * 0.6;
        const done = Math.min(1, Math.max(0, (innerHeight * 0.4 - r.top) / Math.max(1, total)));
        setP(done);
        setShow(r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.3);
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  const left = Math.max(0, Math.ceil(minutes * (1 - p)));
  const C = 2 * Math.PI * 18;
  return (
    <div
      aria-hidden="true"
      className={`rd fixed bottom-5 left-5 z-30 flex items-center gap-3 rounded-full border border-night-line bg-night/90 py-1.5 pl-1.5 pr-4 text-paper shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur transition-[opacity,transform] duration-500 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <svg viewBox="0 0 44 44" className="h-10 w-10 -rotate-90">
        <circle cx="22" cy="22" r="18" className="fill-none stroke-white/10" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r="18"
          className="fill-none stroke-verdigris-bright"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
        />
      </svg>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
        {p >= 0.99 ? "Done. Thanks for reading" : `${left} min left`}
      </span>
    </div>
  );
}
