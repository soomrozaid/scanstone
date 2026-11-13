"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades content up once it enters the viewport. Content is server-rendered
 * and fully visible to crawlers and no-JS users (the .reveal class only
 * applies after hydration), and reduced-motion users see it instantly.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  as?: "div" | "li";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return; // already on screen
    el.classList.add("reveal");
    el.style.transitionDelay = `${delay}ms`;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    Tag === "li" ? (
      <li ref={ref} className={className}>
        {children}
      </li>
    ) : (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  );
}
