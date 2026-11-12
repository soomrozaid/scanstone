"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { buildMatrix } from "@/lib/qr/matrix";
import { renderQRSvg } from "@/lib/qr/svg";

import { whenNear } from "./idle";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const LAYOUTS = {
  wide: {
    W: 960,
    H: 600,
    path: "M190 300 C 300 140, 380 140, 470 300 S 640 460, 755 300",
    grad: [190, 0, 755, 0],
    tent: [40, 110],
    node: [410, 240],
    label: [330, 380],
    phone: [640, 70],
    from: { x: 420, y: 260 },
    scan: { x: -330, y: 40 },
    trial: "grid-cols-2 gap-10 px-6",
  },
  tall: {
    W: 600,
    H: 1000,
    path: "M190 200 C 260 70, 380 70, 440 200 S 455 420, 445 520",
    grad: [190, 200, 445, 520],
    tent: [40, 20],
    node: [380, 140],
    label: [300, 275],
    phone: [330, 500],
    from: { x: 240, y: 520 },
    scan: { x: -255, y: -500 },
    trial: "grid-cols-1 content-center gap-8",
  },
} as const;

const CAPTIONS = [
  {
    k: "01",
    t: "Someone scans the table tent.",
    d: "The printed pattern holds one short link, scst.one/table04. It never changes.",
  },
  {
    k: "02",
    t: "Scanstone looks it up.",
    d: "We check where that link should go today and count the scan. It takes a blink.",
  },
  {
    k: "03",
    t: "You change the page. Not the print.",
    d: "Lunch menu, weekend brunch, Friday's event. Edit the destination and every printed copy follows.",
  },
  {
    k: "04",
    t: "Then the trial ends.",
    d: "A lot of QR generators switch your code off when you stop paying. Ours keeps redirecting, paid or not.",
  },
];

const SCREENS = [
  {
    tag: "yourcafe.ca/menu",
    title: "Lunch menu",
    items: [
      "Soup of the day",
      "Bison chili",
      "Grilled cheese",
      "Saskatoon berry pie",
    ],
  },
  {
    tag: "yourcafe.ca/brunch",
    title: "Weekend brunch",
    items: ["Eggs on toast", "Pancake stack", "Breakfast wrap", "Oat latte"],
  },
  {
    tag: "yourcafe.ca/friday",
    title: "Friday live music",
    items: ["Doors at 7", "Local trio at 8", "Kitchen open late", "No cover"],
  },
];

function Cells({ data, className }: { data: string; className?: string }) {
  const svg = useMemo(
    () =>
      renderQRSvg(data, {
        fg: "#171512",
        bg: "transparent",
        quietZone: 0,
        ecc: "L",
      }),
    [data],
  );
  return (
    <div
      className={`aspect-square [&>svg]:h-full [&>svg]:w-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute h-[460px] w-[230px] rounded-[38px] border border-white/15 bg-[#0b0a09] p-[9px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-paper text-ink">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b0a09]" />
        {children}
      </div>
    </div>
  );
}

function Screen({ s }: { s: (typeof SCREENS)[number] }) {
  return (
    <div className="absolute inset-0 px-5 pt-12">
      <p className="font-mono text-[10px] text-ink-faint">{s.tag}</p>
      <p className="display mt-3 text-[26px] leading-none">{s.title}</p>
      <div className="mt-2 h-1 w-10 rounded-full bg-copper" />
      <ul className="mt-5 space-y-3">
        {s.items.map((it) => (
          <li
            key={it}
            className="flex items-center justify-between border-b border-line pb-2 text-[12px]"
          >
            {it}
            <span className="h-1.5 w-6 rounded-full bg-paper-dim" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScanStory({ qrUrl }: { qrUrl: string }) {
  const root = useRef<HTMLDivElement>(null);
  const stageWrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tall, setTall] = useState(false);
  const L = tall ? LAYOUTS.tall : LAYOUTS.wide;
  const { W, H } = L;

  useEffect(() => {
    const el = stageWrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e!.contentRect;
      const t = window.innerWidth < 640;
      const lay = t ? LAYOUTS.tall : LAYOUTS.wide;
      setTall(t);
      setScale(Math.min(r.width / lay.W, r.height / lay.H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    const cancel = whenNear(el, () =>
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(el);
        const caps = q("[data-cap]");
        const screens = q("[data-screen]");
        const shards = q("[data-shard]");
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(screens.slice(1), { yPercent: 100 });
        gsap.set(q("[data-path]"), {
          strokeDasharray: 900,
          strokeDashoffset: 900,
        });
        gsap.set(q("[data-trial]"), { autoAlpha: 0 });
        gsap.set(q("[data-beam]"), { autoAlpha: 0, top: "8%" });
        gsap.set(q("[data-scanned]"), { autoAlpha: 0, scale: 0.6 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=420%",
            pin: true,
            scrub: 0.8,
            onUpdate: (st) => {
              const p = st.progress;
              el.querySelector("[data-deadcode]")?.classList.toggle(
                "glitch-on",
                p > 0.7 && p < 0.8,
              );
              el.querySelector("[data-deadscreen]")?.classList.toggle(
                "opacity-100",
                p > 0.79,
              );
              const bar = el.querySelector<HTMLElement>("[data-bar]");
              if (bar) bar.style.transform = `scaleX(${p})`;
              const dest = el.querySelector("[data-dest]");
              if (dest) {
                const s2 = Number(gsap.getProperty(screens[2]!, "yPercent"));
                const s1 = Number(gsap.getProperty(screens[1]!, "yPercent"));
                dest.textContent =
                  s2 < 50
                    ? "yourcafe.ca/friday"
                    : s1 < 50
                      ? "yourcafe.ca/brunch"
                      : "yourcafe.ca/menu";
              }
              const day = el.querySelector("[data-day]");
              if (day)
                day.textContent = `Day ${Math.max(1, Math.round(gsap.utils.mapRange(0.66, 1, 1, 1000, p))).toLocaleString("en-CA")}`;
            },
          },
        });

        // 1. phone sweeps over to the tent and scans
        tl.fromTo(
          q("[data-phone]"),
          { ...L.from, rotate: 18 },
          { ...L.scan, rotate: -14, scale: 0.8, duration: 1 },
        )
          .to(q("[data-beam]"), { autoAlpha: 1, duration: 0.1 })
          .to(q("[data-beam]"), { top: "86%", duration: 0.7, ease: "none" })
          .to(q("[data-beam]"), { autoAlpha: 0, duration: 0.1 })
          .to(q("[data-scanned]"), {
            autoAlpha: 1,
            scale: 1,
            duration: 0.25,
            ease: "back.out(2)",
          })
          // 2. the request travels: tent -> Scanstone -> phone
          .to(caps[0]!, { autoAlpha: 0, y: -40, duration: 0.4 })
          .to(caps[1]!, { autoAlpha: 1, y: 0, duration: 0.4 }, "<")
          .to(
            q("[data-phone]"),
            { x: 0, y: 0, rotate: 0, scale: 1, duration: 1 },
            "<",
          )
          .to(q("[data-scanned]"), { autoAlpha: 0, duration: 0.2 }, "<")
          .to(
            q("[data-path]"),
            { strokeDashoffset: 0, duration: 1.1, ease: "none" },
            "<0.2",
          )
          .fromTo(
            q("[data-packet]"),
            { autoAlpha: 1 },
            {
              motionPath: {
                path: "#scan-route",
                align: "#scan-route",
                alignOrigin: [0.5, 0.5],
              },
              duration: 1.1,
              ease: "none",
            },
            "<",
          )
          .fromTo(
            q("[data-node]"),
            { scale: 1 },
            { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1 },
            "<0.45",
          )
          .to(q("[data-packet]"), { autoAlpha: 0, duration: 0.1 })
          // 3. destination swaps, print stays
          .to(caps[1]!, { autoAlpha: 0, y: -40, duration: 0.4 })
          .to(caps[2]!, { autoAlpha: 1, y: 0, duration: 0.4 }, "<")
          .to(screens[1]!, { yPercent: 0, duration: 0.7 })
          .to(screens[2]!, { yPercent: 0, duration: 0.7 }, "+=0.3")
          .to(
            q("[data-tent]"),
            { rotateY: 360, duration: 1.2, ease: "power3.inOut" },
            "<-0.6",
          )
          // 4. trial ends
          .to(caps[2]!, { autoAlpha: 0, y: -40, duration: 0.4 }, "+=0.2")
          .to(caps[3]!, { autoAlpha: 1, y: 0, duration: 0.4 }, "<")
          .to(
            q("[data-story]"),
            { autoAlpha: 0, scale: 0.92, duration: 0.6 },
            "<",
          )
          .to(q("[data-trial]"), { autoAlpha: 1, duration: 0.6 }, "<0.2")
          .to({}, { duration: 0.8 })
          .to(shards, {
            y: () => gsap.utils.random(120, 420),
            x: () => gsap.utils.random(-120, 120),
            rotate: () => gsap.utils.random(-200, 200),
            opacity: 0,
            duration: 1.2,
            ease: "power2.in",
            stagger: { amount: 0.5, from: "random" },
          })
          .to(
            q("[data-alive]"),
            { boxShadow: "0 0 80px 10px rgba(79,174,155,0.45)", duration: 0.6 },
            "<0.4",
          )
          .to({}, { duration: 0.6 });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tall]);

  const trialData = "https://example.com/trial/7f3k";

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-h"
      data-nav="dark"
      className="relative scroll-mt-0 bg-night text-paper motion-reduce:hidden"
    >
      <h2 id="how-h" className="sr-only">
        How it works
      </h2>
      <div ref={root} className="relative h-[100svh] overflow-hidden">
        <div
          className="aurora pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
        />
        <div
          className="gridlines-night pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] gap-4 px-5 pb-16 pt-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:pt-16">
          {/* captions */}
          <div className="relative min-h-[150px] sm:min-h-[180px] lg:min-h-[320px]">
            {CAPTIONS.map((c, i) => (
              <div
                key={c.k}
                data-cap
                className={`absolute inset-0 ${i > 0 ? "invisible opacity-0" : ""}`}
              >
                <p className="font-mono text-xs tracking-[0.2em] text-copper-bright">
                  {c.k} / 04
                </p>
                <h3 className="display mt-4 text-[clamp(2rem,4.6vw,4.2rem)] leading-[0.95] tracking-[-0.02em]">
                  {c.t}
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/65 sm:text-base">
                  {c.d}
                </p>
                {i === 0 && (
                  <p className="mt-6 hidden font-mono text-[11px] uppercase tracking-[0.2em] text-paper/35 lg:block">
                    Scroll
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* stage */}
          <div
            ref={stageWrap}
            className="relative h-full min-h-0 w-full"
            aria-hidden="true"
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: W,
                height: H,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              <div data-story className="absolute inset-0">
                {/* route */}
                <svg
                  className="absolute inset-0"
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  fill="none"
                >
                  <path
                    id="scan-route"
                    d={L.path}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                  />
                  <path
                    data-path
                    d={L.path}
                    stroke="url(#route-g)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="route-g"
                      x1={L.grad[0]}
                      y1={L.grad[1]}
                      x2={L.grad[2]}
                      y2={L.grad[3]}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#e08a46" />
                      <stop offset="1" stopColor="#4fae9b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  data-packet
                  className="absolute left-0 top-0 h-5 w-5 rounded-full bg-copper-bright opacity-0 shadow-[0_0_30px_8px_rgba(224,138,70,0.7)]"
                />

                {/* table tent */}
                <div className="absolute [perspective:900px]" style={{ left: L.tent[0], top: L.tent[1] }}>
                  <div
                    data-tent
                    className="relative h-[380px] w-[300px] [transform-style:preserve-3d]"
                  >
                    <div className="absolute inset-0 rounded-[10px] bg-[#efe7d6] p-7 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] [backface-visibility:hidden]">
                      <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                        Scan for the menu
                      </p>
                      <Cells
                        data={qrUrl}
                        className="mx-auto mt-4 w-[210px] text-ink"
                      />
                      <p className="mt-4 text-center font-mono text-[11px] text-ink-soft">
                        scst.one/table04
                      </p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-[#e6ddc8] text-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <p className="display text-3xl italic">Same print.</p>
                    </div>
                    <div
                      data-beam
                      className="invisible absolute left-4 right-4 h-[3px] rounded-full bg-verdigris-bright shadow-[0_0_24px_6px_rgba(79,174,155,0.7)]"
                    />
                  </div>
                  <div
                    data-scanned
                    className="invisible absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-verdigris-bright px-4 py-1.5 font-mono text-xs text-night"
                  >
                    Scanned
                  </div>
                </div>

                {/* scanstone node */}
                <div
                  data-node
                  style={{ left: L.node[0], top: L.node[1] }}
                  className="absolute flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border border-white/15 bg-night-raised shadow-[0_0_60px_-10px_rgba(79,174,155,0.5)]"
                >
                  <span className="display text-lg">Scanstone</span>
                  <span className="mt-1 font-mono text-[9px] text-paper/50">
                    lookup + count
                  </span>
                </div>
                <div style={{ left: L.label[0], top: L.label[1] }} className="absolute w-[280px] text-center font-mono text-[11px] text-paper/60">
                  scst.one/table04 →{" "}
                  <span data-dest className="text-verdigris-bright">
                    yourcafe.ca/menu
                  </span>
                </div>

                {/* phone */}
                <div
                  data-phone
                  style={{ left: L.phone[0], top: L.phone[1] }}
                  className="absolute h-[460px] w-[230px]"
                >
                  <Phone className="left-0 top-0">
                    {SCREENS.map((s, i) => (
                      <div
                        key={s.tag}
                        data-screen={i}
                        className="absolute inset-0 bg-paper"
                      >
                        <Screen s={s} />
                      </div>
                    ))}
                  </Phone>
                </div>
              </div>

              {/* trial vs scanstone */}
              <div
                data-trial
                className={`invisible absolute inset-0 grid opacity-0 ${L.trial}`}
              >
                <div className="flex flex-col items-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">
                    A typical free-trial code
                  </p>
                  <div
                    data-deadcode
                    className="relative mt-5 rounded-[10px] bg-[#efe7d6] p-6"
                  >
                    <div className="relative aspect-square w-[230px] text-ink">
                      <ShardCells data={trialData} />
                    </div>
                  </div>
                  <div className="relative mt-6 w-[300px] rounded-2xl border border-white/10 bg-night-raised p-4 text-center">
                    <p className="font-mono text-[11px] text-paper/50">
                      trial expired
                    </p>
                    <div
                      data-deadscreen
                      className="opacity-0 transition-opacity duration-300"
                    >
                      <p className="mt-1 text-sm text-[#ff8a7a]">
                        This QR code has been deactivated.
                      </p>
                      <p className="text-xs text-paper/60">
                        Upgrade to reactivate it.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-verdigris-bright">
                    Your Scanstone code
                  </p>
                  <div
                    data-alive
                    className="relative mt-5 rounded-[10px] bg-[#efe7d6] p-6"
                  >
                    <Cells data={qrUrl} className="w-[230px] text-ink" />
                  </div>
                  <div className="mt-6 w-[300px] rounded-2xl border border-verdigris-bright/30 bg-night-raised p-4 text-center">
                    <p data-day className="font-mono text-[11px] text-paper/50">
                      Day 1
                    </p>
                    <p className="mt-1 text-sm text-verdigris-bright">
                      Still redirecting to yourcafe.ca/menu
                    </p>
                    <p className="text-xs text-paper/60">
                      Paid, downgraded or cancelled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* progress */}
        <div
          className="absolute inset-x-5 bottom-6 mx-auto max-w-7xl sm:inset-x-8"
          aria-hidden="true"
        >
          <div className="h-px w-full bg-white/10">
            <div
              data-bar
              className="h-px origin-left scale-x-0 bg-gradient-to-r from-copper-bright to-verdigris-bright"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShardCells({ data }: { data: string }) {
  const m = useMemo(() => buildMatrix(data, "L"), [data]);
  const out: Array<[number, number]> = [];
  for (let r = 0; r < m.size; r++)
    for (let c = 0; c < m.size; c++) if (m.get(r, c)) out.push([r, c]);
  return (
    <>
      {out.map(([r, c]) => (
        <span
          key={`${r}-${c}`}
          data-shard
          className="absolute bg-current"
          style={{
            left: `${(c / m.size) * 100}%`,
            top: `${(r / m.size) * 100}%`,
            width: `${100 / m.size + 0.3}%`,
            height: `${100 / m.size + 0.3}%`,
          }}
        />
      ))}
    </>
  );
}
