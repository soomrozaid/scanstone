"use client";

import { useEffect, useState } from "react";

type Chapter = { sel: string; label: string };

/**
 * Very wide screens only (2xl, where the page margin has room): a quiet chapter rail on the left edge. Ticks for each
 * part of the page, the current one stretches and names itself, and a click
 * glides there. Uses difference blending so it reads on paper and night.
 */
export function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = innerHeight * 0.45;
        let a = -1;
        let lastBottom = Infinity;
        chapters.forEach((c, i) => {
          const el = document.querySelector(c.sel);
          if (!el) return;
          const box = (el.closest(".pin-spacer") ?? el).getBoundingClientRect();
          if (box.top <= mid) a = i;
          lastBottom = box.bottom;
        });
        if (lastBottom < mid) a = -1;
        setActive(a);
      });
    };
    measure();
    addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", measure);
      removeEventListener("resize", measure);
    };
  }, [chapters]);

  const go = (sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const y = (el.closest(".pin-spacer") ?? el).getBoundingClientRect().top + scrollY - 64;
    const l = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (l) l.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Page chapters"
      className={`rail fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 text-white mix-blend-difference transition-opacity duration-500 2xl:block ${active < 0 ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <ol className="flex flex-col gap-2.5">
        {chapters.map((c, i) => (
          <li key={c.sel}>
            <button
              type="button"
              onClick={() => go(c.sel)}
              aria-current={i === active ? "true" : undefined}
              className="group flex items-center gap-3 py-0.5"
            >
              <span className={`block h-px bg-current transition-all duration-500 ${i === active ? "w-10" : "w-4 opacity-50 group-hover:w-7 group-hover:opacity-90"}`} />
              <span className={`font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-500 ${i === active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"}`}>
                {String(i + 1).padStart(2, "0")} {c.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
