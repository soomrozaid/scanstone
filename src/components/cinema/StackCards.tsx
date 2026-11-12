"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/** Sticky cards that stack as you scroll; each one sinks back as the next lands on it. */
export function StackCards({ items }: { items: Array<{ q: string; verdict: string; a: string }> }) {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(el, () =>
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack]", el);
        cards.slice(0, -1).forEach((c, i) => {
          gsap.to(c, {
            scale: 0.9 + i * 0.02,
            filter: "brightness(0.82)",
            ease: "none",
            scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
          });
        });
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }),
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, []);
  return (
    <ol ref={root} className="relative space-y-6 pb-[10svh]">
      {items.map((it, i) => (
        <li
          key={it.q}
          data-stack
          className="sticky origin-top rounded-[32px] border border-line bg-paper p-8 shadow-[0_-20px_60px_-30px_rgba(22,20,17,0.35)] sm:p-12"
          style={{ top: `calc(6rem + ${i * 1.25}rem)` }}
        >
          <div className="flex items-start justify-between gap-6">
            <span className="font-mono text-xs tracking-[0.2em] text-copper">Q{i + 1} / {items.length}</span>
            <span className="display text-[clamp(3rem,7vw,6rem)] italic leading-none text-verdigris">{it.verdict}</span>
          </div>
          <h3 className="display -mt-4 max-w-xl text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.015em] text-ink">
            {it.q}
          </h3>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">{it.a}</p>
        </li>
      ))}
    </ol>
  );
}
