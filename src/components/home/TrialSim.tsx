"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { RollingNumber } from "@/components/cinema/RollingNumber";

const STOPS = [
  { day: 1, label: "Day 1", note: "You print 200 table tents." },
  { day: 14, label: "Day 14", note: "The free trial quietly ends." },
  { day: 15, label: "Day 15", note: "A guest scans the code at dinner." },
  { day: 1095, label: "Year 3", note: "Same tents, still on the tables." },
];

function Phone({
  dead,
  brand,
}: {
  dead: boolean;
  brand: "trial" | "scanstone";
}) {
  return (
    <div className={`ts-phone mx-auto w-full max-w-[190px] rounded-[26px] bg-[#0b0a09] p-1.5 ring-1 ring-white/10 ${dead ? "ts-dead" : brand === "scanstone" ? "ts-alive" : ""}`}>
      <div className="relative aspect-[9/14] overflow-hidden rounded-[20px] bg-black">
        <div
          className={`ts-screen absolute inset-0 flex flex-col bg-white p-4 text-ink ${dead ? "ts-off" : ""}`}
        >
          <div className="h-14 rounded-lg bg-gradient-to-br from-verdigris to-verdigris-deep" />
          <p className="display mt-3 text-lg leading-tight">Tonight&apos;s menu</p>
          {["Soup of the day", "Bison burger", "Saskatoon berry pie"].map(
            (l) => (
              <p
                key={l}
                className="mt-2 border-b border-dashed border-black/10 pb-1.5 text-[0.65rem] text-ink-soft"
              >
                {l}
              </p>
            ),
          )}
        </div>
        <div
          aria-hidden={!dead}
          className={`ts-deadpage absolute inset-0 flex flex-col items-center justify-center bg-[#f3f3f3] p-4 text-center ${dead ? "ts-on" : "opacity-0"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-lg text-danger">
            !
          </div>
          <p className="mt-3 text-[0.75rem] font-semibold text-[#333]">
            This QR code has been deactivated
          </p>
          <p className="mt-1.5 text-[0.62rem] leading-snug text-[#666]">
            Upgrade your plan to reactivate it.
          </p>
          <span className="mt-3 rounded bg-[#333] px-2.5 py-1 text-[0.6rem] text-white">
            See plans
          </span>
        </div>
      </div>
      <p className="sr-only">
        {brand === "trial"
          ? dead
            ? "Trial code: the guest sees a deactivated page."
            : "Trial code: the guest sees the menu."
          : "Scanstone code: the guest sees the menu."}
      </p>
    </div>
  );
}

export function TrialSim() {
  const [s, setS] = useState(0);
  const stop = STOPS[s] ?? STOPS[0]!;
  const trialDead = stop.day >= 15;
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // Plays through the timeline once when it comes into view, until you touch it.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        let n = 0;
        const step = () => {
          if (touched.current || n >= STOPS.length - 1) return;
          n += 1;
          setS(n);
          timer = window.setTimeout(step, n === 1 ? 1500 : 2300);
        };
        timer = window.setTimeout(step, 1100);
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const pick = (v: number) => {
    touched.current = true;
    setS(v);
    if (v === 2) track("marketing_trial_sim", { stop: "day15" });
  };
  const pct = (s / (STOPS.length - 1)) * 100;

  return (
    <div ref={root} className="ts relative overflow-hidden rounded-[28px] border border-night-line bg-night p-5 text-paper shadow-[var(--shadow-lift)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,174,155,0.16),transparent_60%)]" aria-hidden="true" />
      <div className="relative mb-6 flex items-end justify-between gap-4 border-b border-night-line pb-5">
        <div>
          <p className="eyebrow text-paper/60">Time since printing</p>
          <p className="display mt-1 text-5xl leading-none sm:text-6xl" aria-hidden="true">
            <span className="text-paper/40">Day </span>
            <RollingNumber value={stop.day} minDigits={4} />
          </p>
        </div>
        <p key={s} className="ts-note max-w-[14rem] text-right text-sm text-paper/75">{stop.note}</p>
      </div>
      <div className="relative grid grid-cols-2 gap-4 sm:gap-10">
        <div>
          <p className="eyebrow min-h-[2.6em] text-center text-paper/60">Typical trial generator</p>
          <div className="mt-4">
            <Phone dead={trialDead} brand="trial" />
          </div>
          <p
            className={`mt-4 text-center font-mono text-xs uppercase tracking-[0.14em] transition-colors ${trialDead ? "text-[#ff7a6b]" : "text-paper/60"}`}
          >
            {trialDead ? "Code switched off" : "Working"}
          </p>
        </div>
        <div>
          <p className="eyebrow min-h-[2.6em] text-center text-verdigris-bright">Scanstone</p>
          <div className="mt-4">
            <Phone dead={false} brand="scanstone" />
          </div>
          <p className="mt-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-verdigris-bright">
            Working{stop.day > 1 ? ", still" : ""}
          </p>
        </div>
      </div>

      <div className="relative mt-8">
        <label htmlFor="trial-day" className="sr-only">
          Move through time
        </label>
        <input
          id="trial-day"
          type="range"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={s}
          onChange={(e) => pick(Number(e.target.value))}
          aria-valuetext={`${stop.label}: ${stop.note}`}
          className="ts-range w-full cursor-pointer"
          style={{ "--p": `${pct}%` } as React.CSSProperties}
        />
        <div className="mt-2 grid grid-cols-4 text-center">
          {STOPS.map((st, n) => (
            <button
              key={st.label}
              type="button"
              onClick={() => pick(n)}
              className={`eyebrow cursor-pointer py-1 transition-colors ${n === s ? "text-paper" : "text-paper/60 hover:text-paper/85"}`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {stop.label}: {stop.note}
        </p>
      </div>
    </div>
  );
}
