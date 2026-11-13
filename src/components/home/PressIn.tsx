"use client";

import { useEffect, useRef } from "react";

/**
 * Arms the print press once it is near the screen, then runs it when it is
 * well in view. Without JS, or with reduced motion, the prints just sit there.
 */
export function PressIn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.8) return; // already on screen, leave it printed
    el.classList.add("press-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("press-run");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="press">
      {children}
    </div>
  );
}
