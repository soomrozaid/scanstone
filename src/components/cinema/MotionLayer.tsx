"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { onIdle } from "./idle";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide motion: Lenis smooth scroll driving GSAP ScrollTrigger, a custom
 * cursor, magnetic buttons ([data-magnetic]) and film grain. All of it is
 * skipped for reduced motion; cursor and magnets only on fine pointers.
 */
export function MotionLayer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let off = () => {};
    const cancel = onIdle(() => {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      (window as Window & { __lenis?: Lenis }).__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // In-page anchors go through Lenis so the glide matches.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest(
          "a[href*='#']",
        ) as HTMLAnchorElement | null;
        if (!a) return;
        const url = new URL(a.href);
        if (url.pathname !== window.location.pathname || !url.hash) return;
        const el = document.querySelector(url.hash);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -72 });
        history.replaceState(null, "", url.hash);
      };
      document.addEventListener("click", onClick);
      off = () => {
        document.removeEventListener("click", onClick);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    }, 1500);
    return () => {
      cancel();
      off();
    };
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
    const l = (
      window as Window & {
        __lenis?: { scrollTo: (n: number, o: object) => void };
      }
    ).__lenis;
    if (!window.location.hash) l?.scrollTo(0, { immediate: true });
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100;
    let raf = 0;
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let mag: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      const hover = t.closest(
        "a, button, [role='radio'], label, summary, input",
      );
      r.classList.toggle("is-hover", !!hover);
      const m = t.closest("[data-magnetic]") as HTMLElement | null;
      if (mag && mag !== m) {
        gsap.to(mag, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        });
      }
      mag = m;
      if (m) {
        const b = m.getBoundingClientRect();
        gsap.to(m, {
          x: (x - (b.left + b.width / 2)) * 0.3,
          y: (y - (b.top + b.height / 2)) * 0.4,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    };
    const onLeave = () => {
      x = y = -100;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div className="film-grain" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
