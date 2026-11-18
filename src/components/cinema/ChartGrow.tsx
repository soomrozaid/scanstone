"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Marketing-only wrapper for the shared analytics chart: bars rise from the
 * baseline in a wave when it comes into view, breakdown bars fill, and the
 * newest day keeps ticking with a "+1 scan" pop. The chart component itself
 * (shared with the dashboard) is untouched; this only styles its output.
 */
export function ChartGrow({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [pops, setPops] = useState<number[]>([]);
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rects = [...el.querySelectorAll<SVGRectElement>("svg rect")];
    rects.forEach((r, i) => r.style.setProperty("--i", String(i)));
    el.querySelectorAll<HTMLElement>("li .h-full").forEach((b, i) => b.style.setProperty("--i", String(i)));
    el.classList.add("cg-armed");
    let timer = 0;
    let n = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(timer);
        if (!e?.isIntersecting) return;
        el.classList.add("cg-in");
        timer = window.setInterval(() => {
          const last = rects[rects.length - 1];
          last?.classList.remove("cg-tick");
          void last?.getBoundingClientRect();
          last?.classList.add("cg-tick");
          const id = ++n;
          setPops((p) => [...p.slice(-2), id]);
        }, 2400);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);
  return (
    <div ref={root} className="relative">
      {children}
      <div className="pointer-events-none absolute right-1 top-6 h-10 w-24" aria-hidden="true">
        {pops.map((id) => (
          <span key={id} className="cg-pop absolute right-0 top-4 rounded-full bg-verdigris px-2 py-0.5 font-mono text-[10px] text-paper">
            +1 scan
          </span>
        ))}
      </div>
    </div>
  );
}
