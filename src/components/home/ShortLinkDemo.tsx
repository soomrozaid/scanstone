"use client";

import { useEffect, useRef, useState } from "react";

const LONG = "https://yourcafe.ca/menus/2026/summer-menu?utm_source=instagram";
const KEEP = "summer";
const KEEP_AT = LONG.indexOf(KEEP);
const PREFIX = "scst.one/";
const DESTS = ["yourcafe.ca/menus/summer", "yourcafe.ca/menus/fall", "yourcafe.ca/events/patio"];

type Phase = "long" | "crush" | "short";

/**
 * The long address collapses: every character that isn't part of the slug
 * drops out, "summer" slides together and the scst.one prefix types in front.
 * Then the same short link keeps pointing at new places.
 */
export function ShortLinkDemo() {
  const [phase, setPhase] = useState<Phase>("long");
  const [typed, setTyped] = useState(PREFIX.length);
  const [dest, setDest] = useState(0);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        if (reduce) {
          setPhase("short");
          return;
        }
        timers.push(window.setTimeout(() => setPhase("crush"), 500));
        timers.push(
          window.setTimeout(() => {
            setTyped(0);
            setPhase("short");
          }, 2000),
        );
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase !== "short" || typed >= PREFIX.length) return;
    const t = window.setTimeout(() => setTyped((n) => n + 1), 60);
    return () => window.clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "short" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setDest((d) => (d + 1) % DESTS.length), 3200);
    return () => window.clearInterval(t);
  }, [phase]);

  const done = phase === "short" && typed >= PREFIX.length;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[24px] bg-night p-6 text-paper shadow-[var(--shadow-lift)] sm:p-8"
    >
      <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">Your link</p>

        {/* The long URL, one span per character so it can fall apart. */}
        <p
          className={`sl-long mt-3 min-h-[3.5rem] break-all font-mono text-sm leading-relaxed ${phase === "short" ? "sl-gone" : ""}`}
          data-phase={phase}
        >
          <span className="sr-only">{LONG}</span>
          {LONG.split("").map((ch, i) => {
            const keep = i >= KEEP_AT && i < KEEP_AT + KEEP.length;
            return (
              <span
                key={i}
                aria-hidden="true"
                className={keep ? "sl-keep" : "sl-drop"}
                style={
                  {
                    "--i": i,
                    "--r": `${((i * 37) % 120) - 60}deg`,
                  } as React.CSSProperties
                }
              >
                {ch}
              </span>
            );
          })}
        </p>

        <div className="my-5 flex items-center gap-3 text-copper-bright" aria-hidden="true">
          <span className={`sl-rule h-px flex-1 bg-paper/15 ${phase !== "long" ? "sl-rule-on" : ""}`} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Shortened</span>
          <span className={`sl-rule h-px flex-1 bg-paper/15 ${phase !== "long" ? "sl-rule-on" : ""}`} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`whitespace-nowrap font-mono text-[1.65rem] font-medium tracking-tight sm:text-4xl ${done ? "sl-glow" : ""}`}
          >
            <span className="sr-only">{`${PREFIX}${KEEP}`}</span>
            <span aria-hidden="true" className="text-paper">
              {phase === "short" ? PREFIX.slice(0, typed) : ""}
            </span>
            <span aria-hidden="true" className={`text-verdigris-bright ${phase === "long" ? "opacity-0" : "sl-land"}`}>
              {KEEP}
            </span>
            {phase === "short" && typed < PREFIX.length ? (
              <span className="caret ml-0.5 inline-block h-8 w-[3px] translate-y-1 bg-verdigris-bright" aria-hidden="true" />
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
            className="cursor-pointer rounded-full border border-paper/20 px-3.5 py-1.5 text-xs text-paper/75 transition hover:border-paper/50 hover:text-paper"
            aria-live="polite"
          >
            {copied ? "Copied (well, pretend)" : "Copy"}
          </button>
        </div>

        {/* Same link, new place. */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-paper/10 bg-paper/[0.04] px-4 py-3 font-mono text-xs">
          <span className={`h-2 w-2 shrink-0 rounded-full bg-verdigris-bright ${done ? "sl-pulse" : "opacity-30"}`} aria-hidden="true" />
          <span className="text-paper/60">goes to</span>
          <span className="relative h-4 flex-1 overflow-hidden">
            {DESTS.map((d, i) => (
              <span
                key={d}
                className={`sl-dest absolute inset-0 truncate text-paper ${i === dest ? "sl-dest-on" : ""}`}
                aria-hidden={i !== dest}
              >
                {d}
              </span>
            ))}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-paper/10 pt-5 text-xs">
          {[
            ["Share", "Texts, bios, email"],
            ["Edit", "Change where it goes"],
            ["Count", "See clicks by day"],
          ].map(([a, b]) => (
            <div key={a}>
              <dt className="font-medium text-paper">{a}</dt>
              <dd className="mt-1 text-paper/60">{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
