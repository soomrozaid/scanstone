"use client";

import { useEffect, useRef, useState } from "react";

const LONG = "https://yourcafe.ca/menus/2026/summer-menu?utm_source=instagram";
const SHORT = "scst.one/summer";

export function ShortLinkDemo() {
  const [phase, setPhase] = useState<"long" | "short">("long");
  const [typed, setTyped] = useState(SHORT);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setPhase("short"), 0);
      return () => window.clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        setTyped("");
        window.setTimeout(() => setPhase("short"), 700);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "short" || typed.length >= SHORT.length) return;
    const t = window.setTimeout(
      () => setTyped(SHORT.slice(0, typed.length + 1)),
      55,
    );
    return () => window.clearTimeout(t);
  }, [phase, typed]);

  return (
    <div
      ref={ref}
      className="rounded-[24px] border border-line bg-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <p className="eyebrow text-ink-faint">Your link</p>
      <p
        className={`mt-3 break-all rounded-xl border border-line bg-paper-deep/60 p-4 font-mono text-sm transition-all duration-700 ${phase === "short" ? "text-ink-faint line-through decoration-copper/60" : "text-ink-soft"}`}
      >
        {LONG}
      </p>
      <div className="my-5 flex items-center gap-3 text-copper" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="eyebrow">Shortened</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-3xl font-medium tracking-tight text-verdigris-deep sm:text-4xl">
          {typed}
          {typed.length < SHORT.length ? (
            <span className="caret ml-0.5 inline-block h-8 w-[3px] translate-y-1 bg-verdigris" />
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition hover:border-ink-faint hover:text-ink"
          aria-live="polite"
        >
          {copied ? "Copied (well, pretend)" : "Copy"}
        </button>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-xs">
        {[
          ["Share", "Texts, bios, email"],
          ["Edit", "Change where it goes"],
          ["Count", "See clicks by day"],
        ].map(([a, b]) => (
          <div key={a}>
            <dt className="font-medium text-ink">{a}</dt>
            <dd className="mt-1 text-ink-faint">{b}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
