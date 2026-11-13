"use client";

import { useEffect, useRef } from "react";

/**
 * The redirect promise set in a ring around a carved stone. It stamps down on
 * load with a shockwave and a spray of ink, and the ring spins faster while
 * you scroll. Reduced motion: a still seal.
 */
export function PromiseSeal({ className = "" }: { className?: string }) {
  const text = "REDIRECTS NEVER EXPIRE \u2022 PAID OR NOT \u2022 CANCEL ANY TIME \u2022 ";
  const ring = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ring.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let on = false;
    let a = 0;
    let v = 0;
    let last = window.scrollY;
    const tick = () => {
      const y = window.scrollY;
      v += (Math.abs(y - last) - v) * 0.1;
      last = y;
      a = (a + 0.25 + Math.min(v, 80) * 0.12) % 360;
      el.style.transform = `rotate(${a}deg)`;
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
  const specks = Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 14) * Math.PI * 2 + (i % 3) * 0.3;
    const d = 46 + (i % 4) * 7;
    return { x: Math.cos(ang) * d, y: Math.sin(ang) * d, s: 3 + (i % 3) * 2, i };
  });
  return (
    <div className={`seal-stamp relative aspect-square ${className}`} aria-hidden="true">
      <span className="seal-wave absolute inset-[22%] rounded-full border-2 border-current" />
      <span className="seal-wave seal-wave-2 absolute inset-[22%] rounded-full border border-current" />
      {specks.map((p) => (
        <span
          key={p.i}
          className="seal-speck absolute left-1/2 top-1/2 rounded-full bg-current"
          style={{ width: p.s, height: p.s, ["--x" as string]: `${(p.x * 2.4).toFixed(1)}px`, ["--y" as string]: `${(p.y * 2.4).toFixed(1)}px`, ["--d" as string]: `${p.i * 12}ms` }}
        />
      ))}
      <svg ref={ring} viewBox="0 0 200 200" className="absolute inset-0 h-full w-full will-change-transform">
        <defs>
          <path id="seal-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text className="fill-current font-mono text-[11.5px] tracking-[0.18em]">
          <textPath href="#seal-ring">{text}</textPath>
        </text>
      </svg>
      <div className="seal-core absolute inset-[24%] flex items-center justify-center rounded-full bg-[#efe7d6] text-ink shadow-[0_0_80px_-10px_rgba(79,174,155,0.6)]">
        <div className="seal-bob text-center">
          <p className="display text-[clamp(1.4rem,3vw,2.4rem)] leading-none">$0</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">to keep codes alive</p>
        </div>
      </div>
    </div>
  );
}
