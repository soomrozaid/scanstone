"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { onIdle } from "./idle";

gsap.registerPlugin(ScrollTrigger);

function headerOffset() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--header-h")
      .trim() || "4rem"
  );
}

/**
 * Giant type over a veiled tile loop. On desktop the section pins under the
 * header while the lines drift sideways; on phones and reduced motion it
 * stays in normal document flow so it never traps the scroll.
 */
export function VideoType({
  lines,
  label,
}: {
  lines: string[];
  label: string;
}) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          if (!v.dataset.loaded) {
            v.dataset.loaded = "1";
            v.querySelectorAll("source").forEach(
              (s) => (s.src = s.dataset.src ?? ""),
            );
            v.load();
          }
          if (!reduced) v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    if (reduced) return () => io.disconnect();

    const mm = gsap.matchMedia();
    let ctx: gsap.Context | undefined;
    const cancel = onIdle(() => {
      ctx = gsap.context(() => {
        mm.add(
          "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
          () => {
            const rows = gsap.utils.toArray<HTMLElement>("[data-line]");
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: el,
                start: () => `top ${headerOffset()}`,
                end: "+=140%",
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            });
            rows.forEach((line, i) => {
              tl.fromTo(
                line,
                { xPercent: i % 2 ? -18 : 6 },
                { xPercent: i % 2 ? 4 : -22 },
                0,
              );
            });
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
            return () => tl.kill();
          },
        );
        mm.add(
          "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
          () => {
            gsap.utils
              .toArray<HTMLElement>("[data-line]")
              .forEach((line, i) => {
                gsap.fromTo(
                  line,
                  { xPercent: i % 2 ? -12 : 4 },
                  {
                    xPercent: i % 2 ? 3 : -14,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.6,
                    },
                  },
                );
              });
          },
        );
      }, el);
    });
    return () => {
      cancel();
      mm.revert();
      ctx?.revert();
      io.disconnect();
    };
  }, []);

  return (
    <section
      ref={root}
      data-nav="dark"
      aria-label={label}
      className="relative overflow-hidden bg-night md:flex md:min-h-[calc(100svh-var(--header-h,4rem))] md:flex-col md:justify-center"
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover opacity-50"
        muted
        loop
        playsInline
        preload="none"
        poster="/media/tiles-loop.jpg"
        aria-hidden="true"
      >
        <source data-src="/media/tiles-loop.webm" type="video/webm" />
        <source data-src="/media/tiles-loop.mp4" type="video/mp4" />
      </video>
      {/* Veil keeps type contrast stable over the loop. */}
      <div
        className="pointer-events-none absolute inset-0 bg-night/80"
        aria-hidden="true"
      />
      <div className="relative py-8 sm:py-10 md:py-0" aria-hidden="true">
        {lines.map((l, i) => (
          <div
            key={l}
            data-line
            className={`display vt-line whitespace-nowrap py-1 text-[clamp(3rem,14vw,8rem)] font-semibold leading-[0.9] tracking-[-0.04em] md:text-[clamp(3.25rem,11svh,8.5rem)] ${i % 2 ? "italic" : ""}`}
          >
            {l}
            <span className="px-[0.2em] opacity-60">·</span>
            {l}
          </div>
        ))}
      </div>
    </section>
  );
}
