"use client";

import { useEffect, useRef } from "react";

/**
 * The closing CTA card opens out to full width as it scrolls into view. Browsers
 * with CSS scroll-driven animations do that in globals.css. Desktop Safari
 * before 26 has no animation-timeline, so the card never opened there. This
 * drives the same effect from scroll position in those browsers only, by
 * setting --cta-p (0 to 1) on the card.
 */
export function CtaPortalScrub() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const card = ref.current?.closest<HTMLElement>(".cta-portal-card");
    if (!card) return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.dataset.scrub = "1";
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = card.getBoundingClientRect();
      const vh = window.innerHeight;
      // Same range as the CSS version: starts once a fifth of the card has
      // entered, finishes when the card's middle reaches the middle of the screen.
      const start = vh - 0.2 * Math.min(r.height, vh);
      const end = vh / 2 - r.height / 2;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end)));
      card.style.setProperty("--cta-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      delete card.dataset.scrub;
      card.style.removeProperty("--cta-p");
    };
  }, []);
  return <span ref={ref} hidden />;
}
