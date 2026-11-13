"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { time: "07:00", label: "Breakfast", url: "yourcafe.ca/breakfast", items: ["Eggs on toast", "Bannock & jam", "Oat latte"] },
  { time: "11:30", label: "Lunch", url: "yourcafe.ca/lunch", items: ["Soup of the day", "Bison burger", "Garden salad"] },
  { time: "17:00", label: "Dinner", url: "yourcafe.ca/dinner", items: ["Pan-fried pickerel", "Short rib", "Saskatoon berry pie"] },
];

/**
 * Pinned "one day in the dining room": the light moves from morning to night,
 * the clock rolls, and the phone shows a different menu while the table card
 * never changes. Reduced motion shows the breakfast state, unpinned.
 */
export function DayCycle({ qr }: { qr: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(
      el,
      () =>
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const q = gsap.utils.selector(el);
          const n = STAGES.length;
          gsap.set(q("[data-sky]").slice(1), { autoAlpha: 0 });
          gsap.set(q("[data-screen]").slice(1), { yPercent: 100 });
          gsap.set(q("[data-clock]").slice(1), { yPercent: 100, autoAlpha: 0 });
          gsap.set(q("[data-dest]").slice(1), { autoAlpha: 0, y: 10 });
          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: el, start: "top top", end: `+=${n * 70}%`, pin: true, scrub: 0.6 },
          });
          // the sun rides an arc for the whole pin
          tl.fromTo(q("[data-sun]"), { xPercent: -40, yPercent: 60 }, { keyframes: { xPercent: [-40, 120, 300], yPercent: [60, -60, 80] }, ease: "none", duration: n }, 0);
          tl.fromTo(q("[data-sun-core]"), { background: "#e9a86a" }, { keyframes: { background: ["#e9a86a", "#f6efe1", "#c9d6ff"] }, ease: "none", duration: n }, 0);
          for (let i = 1; i < n; i++) {
            const at = i - 0.35;
            tl.to(q("[data-sky]")[i] ?? {}, { autoAlpha: 1, duration: 0.6 }, at)
              .to(q("[data-screen]")[i - 1] ?? {}, { yPercent: -30, autoAlpha: 0.2, duration: 0.6 }, at)
              .to(q("[data-screen]")[i] ?? {}, { yPercent: 0, duration: 0.6 }, at)
              .to(q("[data-clock]")[i - 1] ?? {}, { yPercent: -100, autoAlpha: 0, duration: 0.5 }, at)
              .to(q("[data-clock]")[i] ?? {}, { yPercent: 0, autoAlpha: 1, duration: 0.5 }, at)
              .to(q("[data-dest]")[i - 1] ?? {}, { autoAlpha: 0, y: -10, duration: 0.3 }, at)
              .to(q("[data-dest]")[i] ?? {}, { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.3)
              .fromTo(q("[data-edit]"), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.15, yoyo: true, repeat: 1 }, at)
              .to(q("[data-step]")[i] ?? {}, { color: "#f4efe4", duration: 0.3 }, at)
              .to(q("[data-step]")[i - 1] ?? {}, { color: "rgba(244,239,228,0.6)", duration: 0.3 }, at);
          }
          tl.to({}, { duration: 0.3 });
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          return () => tl.kill();
        }),
      "60% 0px",
    );
    return () => {
      cancel();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="day-h"
      data-nav="dark"
      data-cursor="Scroll"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-night py-20 text-paper"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div data-sky className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,rgba(233,168,106,0.38),transparent_60%),linear-gradient(#1d1712,#14110e)]" />
        <div data-sky className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(127,227,205,0.30),transparent_60%),linear-gradient(#17201d,#121513)]" />
        <div data-sky className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_100%,rgba(120,140,255,0.22),transparent_60%),linear-gradient(#0f0f18,#0b0a09)]" />
        <div data-sun className="absolute left-[10%] top-[40%] h-40 w-40 sm:h-56 sm:w-56">
          <div data-sun-core className="h-full w-full rounded-full bg-[#e9a86a] opacity-70 blur-2xl" />
        </div>
        <div className="gridlines-night absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow text-copper-bright">One code, all day</p>
          <h2 id="day-h" data-no-ink className="display mt-6 text-h2">
            Swap the link between services. <span className="italic text-verdigris-bright">Keep the card.</span>
          </h2>
          <p className="mt-6 max-w-md text-lead text-paper/70">
            Breakfast, lunch and dinner can live at different links. When the service changes, change the
            destination in your dashboard. The card on the table stays where it is.
          </p>
          <ol className="mt-8 flex gap-6 font-mono text-xs uppercase tracking-[0.14em]">
            {STAGES.map((s, i) => (
              <li key={s.label} data-step className={i === 0 ? "text-paper" : "text-paper/60"}>
                {s.time} {s.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-end justify-center gap-6 sm:gap-10" aria-hidden="true">
          <div className="text-center">
            <div className="relative mb-4 h-[1.1em] overflow-hidden font-mono text-4xl tabular-nums sm:text-5xl">
              {STAGES.map((s) => (
                <span key={s.time} data-clock className="absolute inset-x-0 top-0">{s.time}</span>
              ))}
              <span className="invisible">00:00</span>
            </div>
            <div className="w-[130px] -rotate-2 rounded-lg border border-white/10 bg-[#efe7d6] p-3 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:w-[160px]">
              <p className="eyebrow text-center text-[0.5rem] text-ink-faint">Scan for the menu</p>
              <div className="relative mt-2">
                {qr}
                <span data-edit className="absolute -right-4 -top-4 rounded-full bg-verdigris px-2 py-1 font-mono text-[9px] text-paper opacity-0 shadow">
                  same code
                </span>
              </div>
              <p className="mt-2 text-center font-mono text-[0.5rem] text-ink-faint">Table 4</p>
            </div>
          </div>
          <div className="w-[150px] rounded-[26px] bg-[#0b0a09] p-1.5 ring-1 ring-white/10 shadow-[0_0_46px_-6px_rgba(79,174,155,0.35)] sm:w-[190px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] bg-white text-ink">
              {STAGES.map((s) => (
                <div key={s.label} data-screen className="absolute inset-0 flex flex-col bg-white p-4">
                  <p className="font-mono text-[9px] text-ink-faint">{s.url}</p>
                  <p className="display mt-2 text-xl leading-tight">{s.label}</p>
                  <span className="mt-1 block h-0.5 w-8 bg-copper" />
                  {s.items.map((it) => (
                    <p key={it} className="mt-2 border-b border-dashed border-black/10 pb-1.5 text-[0.65rem] text-ink-soft">
                      {it}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="relative mt-3 h-4 overflow-hidden text-center font-mono text-[9px] text-paper/70">
              {STAGES.map((s) => (
                <span key={s.url} data-dest className="absolute inset-x-0">→ {s.url}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
