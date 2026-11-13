"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned section whose cards travel sideways as you scroll down. Each card's
 * [data-par] layer moves at a different rate for parallax depth. Reduced
 * motion falls back to a plain horizontal scroller with snap points.
 */
export function HorizontalGallery({
  heading,
  children,
}: {
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(
      el,
      () =>
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const dist = () => tr.scrollWidth - window.innerWidth;
          const tween = gsap.to(tr, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => `+=${dist()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          gsap.utils.toArray<HTMLElement>("[data-par]", tr).forEach((p) => {
            gsap.fromTo(
              p,
              { xPercent: 18 },
              {
                xPercent: -18,
                ease: "none",
                scrollTrigger: {
                  trigger: p.closest("[data-card]"),
                  containerAnimation: tween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          });
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          return () => tween.kill();
        }),
      "60% 0px",
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, []);

  return (
    <section id="who-its-for" data-nav="dark" data-cursor="Scroll" className="relative bg-night text-paper">
      <div ref={root} className="relative flex h-[100svh] flex-col justify-center overflow-hidden motion-reduce:h-auto motion-reduce:py-24">
        <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8">{heading}</div>
        <div
          ref={track}
          className="relative mt-8 flex w-max gap-5 px-5 sm:mt-10 sm:gap-8 sm:px-8 motion-reduce:w-auto motion-reduce:snap-x motion-reduce:overflow-x-auto lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {children}
          <div className="w-[10vw] shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
