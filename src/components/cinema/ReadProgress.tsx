"use client";

import { useEffect, useRef } from "react";

/** Thin copper-to-verdigris bar under the nav showing how far through the article you are. */
export function ReadProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 h-[2px]" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-copper-bright to-verdigris-bright" />
    </div>
  );
}
