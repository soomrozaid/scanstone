"use client";

import { useEffect, useRef } from "react";

/** The tile loop, loaded only near the viewport and paused off screen. Poster for reduced motion. */
export function LazyVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting) {
          if (!v.dataset.loaded) {
            v.dataset.loaded = "1";
            v.querySelectorAll("source").forEach((s) => (s.src = s.dataset.src ?? ""));
            v.load();
          }
          if (!reduced) v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "300px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={`object-cover ${className}`}
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
  );
}
