"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/**
 * Plan comparison as a night table. A scan line runs down the rows as you
 * scroll and lights each one as it passes; the covenant row gets stamped.
 * Without JS or with reduced motion every row is simply lit.
 */
export function CompareTable({ rows }: { rows: Array<{ label: string; free: string; pro: string }> }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(el, () =>
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("ct-armed");
        const body = el.querySelector("tbody")!;
        const beam = el.querySelector<HTMLElement>("[data-beam]")!;
        gsap.fromTo(
          beam,
          { y: 0, autoAlpha: 1 },
          {
            y: () => body.offsetHeight,
            ease: "none",
            scrollTrigger: { trigger: body, start: "top 70%", end: "bottom 55%", scrub: 0.5, invalidateOnRefresh: true },
          },
        );
        el.querySelectorAll<HTMLElement>("tbody tr").forEach((tr) => {
          ScrollTrigger.create({
            trigger: tr,
            start: "center 64%",
            onEnter: () => tr.classList.add("ct-lit"),
            onLeaveBack: () => tr.classList.remove("ct-lit"),
          });
        });
        ScrollTrigger.refresh();
        return () => el.classList.remove("ct-armed");
      }),
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, []);

  return (
    <div ref={root} className="ct relative mt-12 overflow-x-auto rounded-[24px] border border-paper/10 bg-night-raised/70">
      <table className="relative w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="text-left">
            <th scope="col" className="px-6 py-5 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-paper/60">Feature</th>
            <th scope="col" className="w-36 px-6 py-5 font-medium text-paper">Free</th>
            <th scope="col" className="ct-pro-h relative w-44 px-6 py-5 font-medium text-verdigris-bright">Pro</th>
          </tr>
        </thead>
        <tbody className="relative">
          {rows.map((row) => {
            const covenant = row.label.startsWith("Redirects if");
            return (
              <tr key={row.label} className={`ct-row border-t border-paper/10 ${covenant ? "ct-covenant" : ""}`}>
                <th scope="row" className="px-6 py-4 text-left font-normal text-paper/75">
                  {row.label}
                  {covenant ? (
                    <span className="ct-stamp ml-3 inline-block rounded-full border border-verdigris-bright/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-verdigris-bright">
                      The covenant
                    </span>
                  ) : null}
                </th>
                <td className="px-6 py-4 text-paper/85">{row.free}</td>
                <td className="ct-pro px-6 py-4 font-medium text-paper">{row.pro}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        data-beam
        aria-hidden="true"
        className="ct-beam pointer-events-none invisible absolute inset-x-0 top-[3.6rem] h-px"
      />
    </div>
  );
}
