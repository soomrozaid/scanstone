"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { onIdle } from "./idle";

const TileQR = dynamic(() => import("./TileQR"), { ssr: false });

export type Dest = { biz: string; url: string; note: string };

const DEFAULT_DESTS: Dest[] = [
  { biz: "Café", url: "yourcafe.ca/menu", note: "Lunch menu" },
  { biz: "Café", url: "yourcafe.ca/brunch", note: "Weekend brunch" },
  { biz: "Salon", url: "book.yoursalon.ca", note: "Booking page" },
  { biz: "Realtor", url: "listings.ca/412-elm", note: "Open house" },
  { biz: "Event", url: "yourfest.ca/schedule", note: "Saturday schedule" },
];

/**
 * Only run the 3D scene on a real GPU. Software renderers (SwiftShader,
 * llvmpipe) turn it into seconds of main-thread work, so they get the poster.
 * `?gl=1` forces it on for recordings.
 */
function canWebGL() {
  try {
    if (new URLSearchParams(window.location.search).get("gl") === "1") return true;
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(r);
  } catch {
    return false;
  }
}

/**
 * Full-bleed hero. Text is server-rendered (children) so LCP never waits on
 * WebGL. The 3D tile code loads after the page is idle; until then, and for
 * reduced motion or no WebGL, a static SVG poster of the same code shows.
 */
export function CinemaHero({
  url,
  poster,
  children,
  dests: DESTS = DEFAULT_DESTS,
  layout = "story",
}: {
  dests?: Dest[];
  url: string;
  poster: React.ReactNode;
  children: React.ReactNode;
  /** "tool": first-screen workbench. Art stays decorative and never covers the form. */
  layout?: "story" | "tool";
}) {
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [idx, setIdx] = useState(0);
  const flipAt = useRef(-99);
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [paused, setPaused] = useState(false);

  // Stop rendering the 3D scene once the hero is scrolled away.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!canWebGL()) return;
    const go = () => setUse3D(true);
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1800 });
    else setTimeout(go, 600);
  }, []);

  // Scroll-out: the hero shrinks into a rounded slab and drops back while the
  // copy lifts away and the code leans toward you. GSAP loads after idle.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let kill = () => {};
    const cancel = onIdle(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const st = { trigger: el, start: "top top", end: "bottom top", scrub: 0.4 };
        gsap.fromTo(el, { scale: 1, borderRadius: 0, yPercent: 0 }, { scale: 0.84, borderRadius: 48, yPercent: 10, ease: "none", scrollTrigger: st });
        gsap.fromTo(el.querySelectorAll("[data-hero-art]"), { scale: 1, rotate: 0 }, { scale: 1.28, rotate: -6, ease: "none", scrollTrigger: st });
        // The tool itself must stay readable and clickable. Only the story
        // hero lifts its copy away; the workbench stays put.
        if (layout !== "tool") {
          gsap.fromTo(el.querySelector("[data-hero-copy]"), { y: 0, opacity: 1 }, { y: -140, opacity: 0, ease: "power1.in", scrollTrigger: { ...st, end: "70% top" } });
          gsap.fromTo(el.querySelector("[data-hero-shade]"), { opacity: 0 }, { opacity: 0.6, ease: "none", scrollTrigger: st });
        }
      }, el);
      kill = () => ctx.revert();
    });
    return () => {
      cancel();
      kill();
    };
  }, [layout]);

  useEffect(() => {
    if (paused || !onScreen) return;
    const id = setInterval(() => {
      flipAt.current = performance.now() / 1000;
      setIdx((i) => (i + 1) % DESTS.length);
    }, 4200);
    return () => clearInterval(id);
  }, [DESTS.length, paused, onScreen]);

  const d = DESTS[idx] ?? DESTS[0]!;

  return (
    <section
      ref={sectionRef}
      data-nav="dark"
      className={`relative -mt-16 flex min-h-[100svh] origin-[50%_100%] flex-col overflow-hidden bg-night text-paper [transform-style:flat] ${layout === "tool" ? "home-tool-hero" : ""}`}
    >
      {/* moving light + grain */}
      <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="gridlines-night pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* poster: same code, static */}
      <div data-hero-art className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute transition-opacity duration-[1400ms] ${
          layout === "tool"
            ? `hidden lg:block lg:left-[76%] lg:top-[48%] lg:w-[min(28vw,52svh)] lg:-translate-x-1/2 lg:-translate-y-1/2 ${ready ? "opacity-0" : "opacity-100"}`
            : `left-1/2 top-[21svh] w-[min(50vw,25svh)] -translate-x-1/2 -translate-y-1/2 lg:left-[77%] lg:top-[48%] lg:w-[min(30vw,58svh)] ${ready ? "opacity-0" : "opacity-100"}`
        }`}
      >
        <div className="poster-tilt rounded-[6px] bg-[#efe7d6] shadow-[0_40px_120px_-20px_rgba(79,174,155,0.35)]">
          {poster}
        </div>
      </div>
      </div>

      {use3D && (
        <div data-hero-art className={`pointer-events-none absolute inset-0 ${layout === "tool" ? "hidden lg:block" : ""}`} aria-hidden="true">
          <TileQR
            url={url}
            active={onScreen}
            flipAt={flipAt}
            onReady={() => setReady(true)}
            onSettled={() => setSettled(true)}
          />
        </div>
      )}

      {/* destination readout */}
      <div className={`absolute z-10 ${
        layout === "tool"
          ? "hidden lg:flex lg:left-[76%] lg:bottom-[7svh] lg:-translate-x-1/2 lg:items-center lg:gap-2"
          : "left-1/2 top-[calc(21svh+min(25vw,12.5svh)+34px)] flex -translate-x-1/2 items-center gap-2 lg:left-[77%] lg:top-auto lg:bottom-[7svh]"
      }`}>
        <div
          key={idx}
          className={`dest-swap flex items-center gap-2 whitespace-nowrap rounded-full border border-night-line bg-night-raised/80 px-4 py-2 font-mono text-[11px] text-paper/80 backdrop-blur transition-opacity sm:text-xs ${settled || !use3D ? "opacity-100" : "opacity-0"}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris-bright shadow-[0_0_10px_2px_rgba(79,174,155,0.8)]" />
          <span className="text-paper/50">{d.biz}</span>
          <span aria-hidden="true">→</span>
          <span className="text-paper">{d.url}</span>
        </div>
        <button
          type="button"
          className="rounded-full border border-night-line bg-night-raised/80 px-3 py-2 text-[11px] text-paper/80 backdrop-blur hover:text-paper"
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? "Play examples" : "Pause examples"}
        </button>
      </div>
      <p className="sr-only" aria-live="off">
        One printed code, pointed at a café menu, a booking page, a listing or
        an event schedule.
      </p>

      <div data-hero-copy className={`relative z-10 ${layout === "tool" ? "flex flex-1 items-center" : "mt-auto"}`}>{children}</div>
      <div data-hero-shade className="pointer-events-none absolute inset-0 z-20 bg-night opacity-0" aria-hidden="true" />
    </section>
  );
}
