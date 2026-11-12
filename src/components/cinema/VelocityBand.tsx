"use client";

import { useEffect, useRef } from "react";

/**
 * Two counter-running lines of giant type. They drift on their own, speed up
 * with your scroll, and lean into the direction you're moving. Only runs while
 * on screen; reduced motion shows them still.
 */
export function VelocityBand({ lines }: { lines: [string, string] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = [...el.querySelectorAll<HTMLElement>("[data-row]")];
    let raf = 0;
    let on = false;
    let last = window.scrollY;
    let vel = 0;
    const pos = [0, -25];
    const tick = () => {
      const y = window.scrollY;
      const dv = y - last;
      last = y;
      vel += (dv - vel) * 0.12;
      const boost = Math.min(6, Math.abs(vel) * 0.06);
      rows.forEach((r, i) => {
        const dir = i ? 1 : -1;
        const n = pos[i]! + 50 + dir * (0.035 + boost * 0.05);
        pos[i] = (((n % 50) + 50) % 50) - 50;
        const skew = Math.max(-12, Math.min(12, vel * -0.25));
        r.style.transform = `translate3d(${pos[i]}%,0,0) skewX(${skew}deg)`;
      });
      if (on) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      on = !!e?.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) {
        last = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={root} aria-hidden="true" className="vband relative select-none overflow-hidden border-y border-line bg-paper py-6 sm:py-10">
      {lines.map((l, i) => (
        <div key={l} data-row className="flex w-max whitespace-nowrap will-change-transform" style={{ transform: `translate3d(${i ? -25 : 0}%,0,0)` }}>
          {[0, 1, 2, 3].map((k) => (
            <span
              key={k}
              className={`display px-6 text-[clamp(3rem,9vw,8rem)] leading-[1.05] tracking-[-0.03em] ${i ? "italic text-verdigris" : "text-ink"}`}
            >
              {l}
              <span className="mx-6 inline-block translate-y-[-0.1em] text-copper">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
