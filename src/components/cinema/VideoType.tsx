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
 * Giant type over a veiled tile loop: a short list of places people print a
 * code. Each place appears once. As you scroll, the places light up one at a
 * time and slide into line, like items being ticked off. On desktop the
 * section pins under the header while that happens; on phones it stays in
 * normal document flow so it never traps the scroll. Reduced motion shows the
 * finished list.
 */
export function VideoType({
  lines,
  eyebrow,
  title,
  id = "where-h",
}: {
  lines: string[];
  eyebrow: string;
  title: string;
  id?: string;
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
        const from = (i: number) => ({
          opacity: 0.14,
          xPercent: i % 2 ? -6 : 6,
        });
        mm.add(
          "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
          () => {
            const rows = gsap.utils.toArray<HTMLElement>("[data-line]");
            const tl = gsap.timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: el,
                start: () => `top ${headerOffset()}`,
                end: "+=120%",
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            });
            rows.forEach((line, i) => {
              tl.fromTo(line, from(i), { opacity: 1, xPercent: 0, duration: 1 }, i * 0.8);
            });
            // A short hold at the end so the full list reads before unpinning.
            tl.to({}, { duration: 0.8 });
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
                gsap.fromTo(line, from(i), {
                  opacity: 1,
                  xPercent: 0,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: line,
                    start: "top 92%",
                    end: "top 60%",
                    scrub: 0.6,
                  },
                });
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
      aria-labelledby={id}
      className="relative overflow-hidden bg-night text-paper md:flex md:min-h-[calc(100svh-var(--header-h,4rem))] md:flex-col md:justify-center"
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
      <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 md:py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-bright">
          {eyebrow}
        </p>
        <h2
          id={id}
          data-no-ink
          className="mt-3 max-w-2xl text-lg leading-snug text-paper/85 sm:text-xl"
        >
          {title}
        </h2>
        <ul className="mt-6 md:mt-8">
          {lines.map((l, i) => (
            <li
              key={l}
              data-line
              className={`display vt-line flex items-baseline gap-[0.25em] py-1 text-[clamp(2.6rem,12vw,7rem)] font-semibold leading-[0.92] tracking-[-0.04em] md:text-[clamp(3rem,10svh,7.5rem)] ${i % 2 ? "italic md:pl-[8vw]" : ""}`}
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] font-normal sm:text-xs not-italic tracking-normal text-copper-bright [-webkit-text-fill-color:currentColor]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
