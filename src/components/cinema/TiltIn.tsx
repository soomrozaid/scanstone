"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-scrubbed landing: the block starts tipped back in 3D, lower and a
 * little smaller, and settles flat onto the page as it reaches the middle of
 * the screen, like a print laid on a table. Reduced motion leaves it flat.
 */
export function TiltIn({ children, className = "", from = 24 }: { children: React.ReactNode; className?: string; from?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(o, () =>
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          i,
          { rotateX: from, y: 90, scale: 0.9, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: o, start: "top 95%", end: "top 35%", scrub: 0.6 },
          },
        );
      }),
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, [from]);
  return (
    <div ref={outer} className={`[perspective:1400px] ${className}`}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
