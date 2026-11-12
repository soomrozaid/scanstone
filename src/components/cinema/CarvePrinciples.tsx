"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

type Item = { word: string; t: string; d: string; link: { href: string; label: string } };

/**
 * Pinned sequence: each principle's word is carved into the stage left to
 * right, a copper spark riding the chisel edge, then its reasoning settles in
 * beside it. Reduced motion gets the plain list rendered by the page instead.
 */
export function CarvePrinciples({ items }: { items: Item[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(
      el,
      () =>
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const q = gsap.utils.selector(el);
          const panels = q("[data-panel]");
          gsap.set(panels.slice(1), { autoAlpha: 0 });
          gsap.set(q("[data-word]"), { clipPath: "inset(0 100% 0 0)" });
          gsap.set(q("[data-spark]"), { left: "0%", autoAlpha: 0 });
          gsap.set(q("[data-copy]"), { autoAlpha: 0, y: 30 });
          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: el, start: "top top", end: `+=${items.length * 90}%`, pin: true, scrub: 0.7 },
          });
          panels.forEach((p, i) => {
            const word = p.querySelector("[data-word]") ?? {};
            const spark = p.querySelector("[data-spark]") ?? {};
            const copy = p.querySelector("[data-copy]") ?? {};
            const bar = q("[data-progress]")[i] ?? {};
            if (i > 0) tl.to(p, { autoAlpha: 1, duration: 0.05 });
            tl.to(spark, { autoAlpha: 1, duration: 0.05 })
              .to(word, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "none" }, "<")
              .to(spark, { left: "100%", duration: 1, ease: "none" }, "<")
              .to(bar, { scaleX: 1, duration: 1, ease: "none" }, "<")
              .to(spark, { autoAlpha: 0, duration: 0.15 })
              .to(copy, { autoAlpha: 1, y: 0, duration: 0.5 }, "<")
              .to({}, { duration: 0.6 });
            if (i < panels.length - 1)
              tl.to(p, { autoAlpha: 0, yPercent: -8, filter: "blur(6px)", duration: 0.45 });
          });
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          return () => tl.kill();
        }),
      "60% 0px",
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, [items.length]);

  return (
    <div ref={root} data-cursor="Scroll" className="relative h-[100svh] overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="gridlines-night pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute inset-x-0 top-24 z-10 mx-auto flex max-w-6xl gap-2 px-5 sm:px-8" aria-hidden="true">
        {items.map((it) => (
          <span key={it.word} className="h-px flex-1 bg-paper/15">
            <span data-progress className="block h-full origin-left scale-x-0 bg-copper-bright" />
          </span>
        ))}
      </div>
      {items.map((it, i) => (
        <div key={it.word} data-panel className="absolute inset-0 flex items-center">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">
                0{i + 1} / 0{items.length}
              </p>
              <div className="relative mt-4 w-fit">
                <p aria-hidden="true" className="display text-[clamp(4rem,13vw,11rem)] italic leading-[0.95] tracking-[-0.04em] text-paper/[0.07]">
                  {it.word}
                </p>
                <p
                  data-word
                  aria-hidden="true"
                  className="carve-word display absolute inset-0 text-[clamp(4rem,13vw,11rem)] italic leading-[0.95] tracking-[-0.04em]"
                >
                  {it.word}
                </p>
                <span data-spark aria-hidden="true" className="carve-spark absolute top-[10%] h-[80%] w-[3px] -translate-x-1/2" />
              </div>
            </div>
            <div data-copy className="max-w-md pb-3">
              <h3 className="display text-3xl text-paper">{it.t}</h3>
              <p className="mt-4 leading-relaxed text-paper/70">{it.d}</p>
              <Link href={it.link.href} className="link-underline mt-6 inline-block text-sm text-verdigris-bright">
                {it.link.label} →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
