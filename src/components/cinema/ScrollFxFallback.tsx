"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Range = "entry" | "cover";
type Rule = {
  sel: string;
  /** The effect runs on this pseudo-element of the matched element. */
  pseudo?: "::before";
  /** Element whose position drives the effect. Defaults to the element itself. */
  timeline?: string;
  start: [Range, number | ((el: HTMLElement) => number)];
  end: [Range, number | ((el: HTMLElement) => number)];
};

const idx = (el: HTMLElement) => Number(el.style.getPropertyValue("--i")) || 0;

/** Same elements and ranges as the animation-timeline: view() rules in globals.css. */
const RULES: Rule[] = [
  { sel: "main h2.display:not([data-no-ink])", start: ["entry", 10], end: ["cover", 28] },
  { sel: ".article-ink strong", start: ["entry", 40], end: ["cover", 45] },
  { sel: ".article-ink h2", pseudo: "::before", start: ["entry", 20], end: ["cover", 35] },
  { sel: ".article-ink blockquote", start: ["entry", 10], end: ["cover", 40] },
  { sel: ".night-portal", start: ["entry", 0], end: ["entry", 65] },
  { sel: ".night-portal > *", start: ["entry", 0], end: ["entry", 80] },
  { sel: ".covenant", start: ["entry", 0], end: ["cover", 35] },
  { sel: ".covenant-sign", start: ["entry", 40], end: ["cover", 55] },
  { sel: ".covenant-seal", start: ["entry", 30], end: ["cover", 45] },
  {
    sel: ".wm-l",
    timeline: ".wm",
    start: ["entry", (el) => 5 + idx(el) * 5],
    end: ["entry", (el) => 75 + idx(el) * 3],
  },
  { sel: ".cta-horizon", timeline: ".cta-portal", start: ["cover", 25], end: ["cover", 50] },
];

/** The CSS animations to seek for an element (or one of its pseudo-elements). */
function animationsOf(el: HTMLElement, pseudo?: string): Animation[] {
  if (pseudo) {
    return document
      .getAnimations()
      .filter((a) => {
        const fx = a.effect as KeyframeEffect | null;
        return fx?.target === el && fx.pseudoElement === pseudo;
      });
  }
  return el.getAnimations().filter((a) => {
    const fx = a.effect as KeyframeEffect | null;
    return fx?.target === el && !fx.pseudoElement;
  });
}

/** How far into a view() range the subject is, in px scrolled since it touched the bottom edge. */
function offset(range: Range, pct: number, h: number, vh: number) {
  const len = range === "entry" ? Math.min(h, vh) : vh + h;
  return (pct / 100) * len;
}

/**
 * Drives the scroll-linked effects in browsers without CSS scroll-driven
 * animations (desktop Safari before 26). Chrome, Edge and newer Safari use the
 * CSS rules and never run this. It only reads positions and sets --sfx-p, so
 * it doesn't touch Lenis or page scrolling.
 */
export function ScrollFxFallback() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof CSS === "undefined" || CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("sfx");

    let items: Array<{
      el: HTMLElement;
      tl: HTMLElement;
      pseudo?: string;
      s: number | ((el: HTMLElement) => number);
      e: number | ((el: HTMLElement) => number);
      sr: Range;
      er: Range;
    }> = [];
    const collect = () => {
      items = [];
      for (const r of RULES) {
        document.querySelectorAll<HTMLElement>(r.sel).forEach((el) => {
          const tl = r.timeline ? el.closest<HTMLElement>(r.timeline) : el;
          if (tl) items.push({ el, tl, pseudo: r.pseudo, s: r.start[1], e: r.end[1], sr: r.start[0], er: r.end[0] });
        });
      }
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rects = new Map<HTMLElement, DOMRect>();
      for (const it of items) {
        let rc = rects.get(it.tl);
        if (!rc) {
          rc = it.tl.getBoundingClientRect();
          rects.set(it.tl, rc);
        }
        const d = vh - rc.top; // px since the subject's top touched the bottom edge
        const sPct = typeof it.s === "function" ? it.s(it.el) : it.s;
        const ePct = typeof it.e === "function" ? it.e(it.el) : it.e;
        const a = offset(it.sr, sPct, rc.height, vh);
        const b = offset(it.er, ePct, rc.height, vh);
        const p = Math.min(1, Math.max(0, (d - a) / Math.max(1, b - a)));
        it.el.style.setProperty("--sfx-p", p.toFixed(3));
        const t = Math.min(999, p * 1000);
        for (const anim of animationsOf(it.el, it.pseudo)) anim.currentTime = t;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    collect();
    update();
    // Content that mounts later (lazy sections, route changes) is picked up here.
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = window.setTimeout(() => {
        pending = 0;
        collect();
        onScroll();
      }, 200);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mo.disconnect();
      window.clearTimeout(pending);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("sfx");
      for (const it of items) it.el.style.removeProperty("--sfx-p");
    };
  }, [pathname]);
  return null;
}
