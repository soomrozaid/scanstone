"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { onIdle } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/**
 * Giant type with the tile loop playing inside the letters (multiply mask).
 * Lines slide in opposite directions with scroll. The video only loads when
 * the section is near the viewport, and never autoplays for reduced motion.
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
    let ctx: gsap.Context | undefined;
    const cancel = onIdle(
      () =>
        (ctx = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-line]").forEach((line, i) => {
            gsap.fromTo(
              line,
              { xPercent: i % 2 ? -18 : 6 },
              {
                xPercent: i % 2 ? 4 : -22,
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
        }, el)),
    );
    return () => {
      cancel();
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      data-nav="dark"
      aria-label={label}
      className="relative overflow-hidden bg-night"
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
      {/* Veil keeps the type above WCAG AA no matter how dark the loop is.
          mix-blend-multiply on night made the white letters nearly black. */}
      <div
        className="pointer-events-none absolute inset-0 bg-night/70"
        aria-hidden="true"
      />
      <div className="relative py-10 sm:py-16" aria-hidden="true">
        {lines.map((l, i) => (
          <div
            key={l}
            data-line
            className={`display vt-line whitespace-nowrap py-1 text-[clamp(4.5rem,15vw,15rem)] font-semibold leading-[0.9] tracking-[-0.04em] ${i % 2 ? "italic" : ""}`}
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
